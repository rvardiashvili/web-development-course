import { showDetailsPopup } from './detailsPopup.js';
export function setFollowListener(currentUserId, targetUserId, followers_element = NaN, following_element = NaN){
    if(currentUserId !== targetUserId){
    document.querySelector('.follow-button').addEventListener('click', function(event){
        try {
            triggerFollow(currentUserId, targetUserId, followers_element);
            
        }
        catch (error) {
            console.error('Error triggering follow:', error);
        }
    });
    }
    document.getElementById('followers-btn').addEventListener('click', async function(){
        try {
            const followBtn = document.querySelector('.follow-button');
            const status = await fetchAndRenderFollows(targetUserId, followers_element  );
            const userData = [];
            console.log(status)
            for (let i = 0; i < status[0]; i++){
                if(status[0][i]){
                    const response = await fetch(`/api/profile/${status[0][i]}`);
                    const data = await response.json();
                    userData.push(data);
                }
            }
            
            showDetailsPopup(null, 'follow-list', userData);
        }
        catch (error) {
            console.error('Error fetching and rendering follows:', error);
        }
    });
    document.getElementById('following-btn').addEventListener('click', async function(){
        try {
            const followBtn = document.querySelector('.follow-button');
            const status = await fetchAndRenderFollows(targetUserId, NaN, following_element);
            const userData = [];
            console.log(status)
            for (let i = 0; i < status[1]; i++){
                if(status[1][i]){
                    const response = await fetch(`/api/profile/${status[1][i]}`);
                    const data = await response.json();
                    userData.push(data);
                }
            }
            
            showDetailsPopup(null, 'follow-list', userData);
        }
        catch (error) {
            console.error('Error fetching and rendering follows:', error);
        }
    });
}

async function triggerFollow(currentUserId, targetUserId, followers_element = NaN, following_element = NaN){
    const response = await fetch(`/api/profile/follow/${targetUserId}`);
    const data = await response.json();

    if (data.status === 'success') {
        toggleFollowStatus(targetUserId, currentUserId, followers_element, following_element);
        return true;
    }else{
        return false;
    }
}

async function toggleFollowStatus(viewedUserId, currentUserId, followers_element = NaN, following_element = NaN){
    const followBtn = document.querySelector('.follow-button');
    const status = await fetchAndRenderFollows(viewedUserId, followers_element, following_element);
    console.log('status:', status)
    if (status[0]){
        console.log('Following:', status[0]);
        if(status[0].includes(parseInt  (currentUserId))){
            followBtn.style.backgroundColor = 'rgb(139, 139, 139)';
            followBtn.innerHTML = 'Unfollow';
        }else{
            followBtn.innerHTML = 'Follow';
            followBtn.style.backgroundColor = '#4a64f2';
        }
    }
}

    
async function fetchAndRenderFollows(userId, followers_element = NaN, following_element = NaN){
    const respose = await fetch(`/api/profile/follows/${userId}`)
    const data = await respose.json()
    console.log('data:', data)
    const following = data.followers;
    const followers = data.following;
    if(followers_element) followers_element.innerHTML = followers.length;
    if(following_element) following_element.innerHTML = following.length;
    return [followers, following];
}
export { toggleFollowStatus, fetchAndRenderFollows };