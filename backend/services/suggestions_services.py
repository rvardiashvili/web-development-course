from sqlalchemy import func, or_, and_, select
from sqlalchemy.orm import aliased
import random
from database.database import db
from models.users import Users, Followers
from models.social.groups import Group, GroupMembership

def get_suggestions(current_user_id, limit=20):
    """
    Generates a list of unique user and group suggestions for the given user.
    """
    all_suggestions = []
    # Sets to track IDs of already suggested users and groups to prevent duplicates
    suggested_user_ids = {current_user_id}
    suggested_group_ids = set()
    
    # Subquery for users the current user already follows
    already_followed_subq = select(Followers.followed_id).filter(Followers.follower_id == current_user_id).scalar_subquery()
    
    # Subquery for groups the current user is already a member of
    my_groups_subq = select(GroupMembership.group_id).filter(GroupMembership.user_id == current_user_id).scalar_subquery()

    # 1. Groups shared with followed users
    followed_users_subq = select(Followers.followed_id).filter(Followers.follower_id == current_user_id).scalar_subquery()
    shared_groups = db.session.execute(
        select(Group, func.count(GroupMembership.user_id).label('common_members'))
        .join(GroupMembership, Group.group_id == GroupMembership.group_id)
        .filter(
            GroupMembership.user_id.in_(followed_users_subq),
            Group.group_id.notin_(my_groups_subq) # Exclude groups user is already in
        )
        .group_by(Group.group_id)
        .order_by(db.desc('common_members'))
        .limit(limit)
    ).all()
    for group, count in shared_groups:
        if group.group_id not in suggested_group_ids:
            reason = f"Joined by {count} people you follow"
            all_suggestions.append({
                "type": "group",
                "data": {
                    'group_id': group.group_id,
                    'name': group.name,
                    'profile_picture': group.profile_picture or '/static/media/default/community.png'
                },
                "reason": reason
            })
            suggested_group_ids.add(group.group_id)

    # 2. Users followed by followed users
    f1 = aliased(Followers)
    f2 = aliased(Followers)
    two_hop_followers = db.session.execute(
        select(Users, func.count(f2.follower_id).label('mutual_connections'))
        .join(f1, Users.user_id == f1.followed_id)
        .join(f2, f1.follower_id == f2.followed_id)
        .filter(
            f2.follower_id == current_user_id,
            Users.user_id != current_user_id,
            Users.user_id.notin_(already_followed_subq)
        )
        .group_by(Users.user_id)
        .order_by(db.desc('mutual_connections'))
        .limit(limit)
    ).all()
    for user, count in two_hop_followers:
        if user.user_id not in suggested_user_ids:
            reason = f"Followed by {count} people you follow"
            all_suggestions.append({
                "type": "user",
                "data": {
                    'user_id': user.user_id,
                    'username': user.username,
                    'full_name': user.full_name,
                    'profile_picture': user.profile_picture or '/static/media/default/pfp.jpg'
                },
                "reason": reason
            })
            suggested_user_ids.add(user.user_id)

    # 3. Groups with many common members (not necessarily followed users)
    if len(all_suggestions) < limit:
        common_group_memberships = db.session.execute(
            select(Group, func.count(GroupMembership.user_id).label('common_members_count'))
            .join(GroupMembership, Group.group_id == GroupMembership.group_id)
            .filter(
                GroupMembership.user_id.in_(
                    select(GroupMembership.user_id)
                    .filter(GroupMembership.group_id.in_(my_groups_subq))
                ),
                Group.group_id.notin_(my_groups_subq)
            )
            .group_by(Group.group_id)
            .order_by(db.desc('common_members_count'))
            .limit(limit)
        ).all()
    
        for group, count in common_group_memberships:
            if group.group_id not in suggested_group_ids:
                reason = f"Has {count} members in common with your groups"
                all_suggestions.append({
                    "type": "group",
                    "data": {
                        'group_id': group.group_id,
                        'name': group.name,
                        'profile_picture': group.profile_picture or '/static/media/default/community.png'
                    },
                    "reason": reason
                })
                suggested_group_ids.add(group.group_id)
    
    # 4. Users who are members of groups the current user is in
    if len(all_suggestions) < limit:
        common_group_users = db.session.execute(
            select(Users, func.count(GroupMembership.group_id).label('common_groups_count'))
            .join(GroupMembership, Users.user_id == GroupMembership.user_id)
            .filter(
                GroupMembership.group_id.in_(my_groups_subq),
                Users.user_id != current_user_id,
                Users.user_id.notin_(already_followed_subq)
            )
            .group_by(Users.user_id).order_by(db.desc('common_groups_count')).limit(limit)
        ).all()
            
        for user, count in common_group_users:
            if user.user_id not in suggested_user_ids:
                reason = f"In {count} groups with you"
                all_suggestions.append({
                    "type": "user",
                    "data": {
                        'user_id': user.user_id,
                        'username': user.username,
                        'full_name': user.full_name,
                        'profile_picture': user.profile_picture or '/static/media/default/pfp.jpg'
                    },
                    "reason": reason
                })
                suggested_user_ids.add(user.user_id)
            
    # Mark the end of personalized, high-priority suggestions
    personalized_count = len(all_suggestions)

        # 6. Random Groups (if suggestions are still few)
    if len(all_suggestions) < limit:
        random_groups = db.session.execute(
            select(Group)
            .filter(
                Group.group_id.notin_(suggested_group_ids), # Exclude already suggested/joined groups
                Group.group_id.notin_(my_groups_subq)
            )
            .order_by(func.random())
            .limit(limit - len(all_suggestions))
        ).scalars().all()
        for group in random_groups:
            all_suggestions.append({
                "type": "group",
                "data": {
                    'group_id': group.group_id,
                    'name': group.name,
                    'profile_picture': group.profile_picture or '/static/media/default/community.png'},
                    "reason": "Suggested for you"
                })

    # 5. Random Users (if suggestions are still few)
    if len(all_suggestions) < limit:
        random_user_results = db.session.execute(
            select(Users)
            .filter(
                Users.user_id.notin_(suggested_user_ids), # Exclude already suggested/followed users
                Users.user_id.notin_(already_followed_subq)
            )
            .order_by(func.random())
            .limit(limit - len(all_suggestions))
        ).scalars().all()
        for user in random_user_results:
            all_suggestions.append({
                "type": "user",
                "data": {
                    'user_id': user.user_id,
                    'username': user.username,
                    'full_name': user.full_name,
                    'profile_picture': user.profile_picture or '/static/media/default/pfp.jpg'
                },
                "reason": "Suggested for you"
            })
    

                    
    # Separate personalized from fallback suggestions
    personalized = all_suggestions[:personalized_count]
    fallback = all_suggestions[personalized_count:]

    # Shuffle each list independently to mix their order within their priority tier
    random.shuffle(personalized)
    random.shuffle(fallback)

    # Combine the lists, with personalized suggestions appearing first
    final_suggestions = personalized + fallback

    # Ensure the final list does not exceed the limit
    return final_suggestions[:limit]
