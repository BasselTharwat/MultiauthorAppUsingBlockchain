const routes = require('next-routes')(); 
//this require statement returns a function

routes
    .add('/stories/:address/viewStory', 'stories/viewStory')
    .add('/stories/:address/viewRequestsToJoin', 'stories/viewRequestsToJoin')
    .add('/stories/:address/newChapterRequest', 'stories/newChapterRequest')


module.exports = routes;  
