const routes = require('next-routes')(); 
//this require statement returns a function

routes
    .add('/stories/:address', 'stories/viewStory')
    .add('/stories/:address/viewRequestsToJoin', 'stories/viewRequestsToJoin')
    .add('/stories/:address/newChapter', 'stories/newChapter')


module.exports = routes;  
