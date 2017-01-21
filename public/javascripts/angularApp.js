var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {                                      //resolve property in this way, we are ensuring that anytime our home state is entered
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                }
            })
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve : {
                    post : ['$stateParams', 'posts',
                        function($stateParams, posts) {
                            return posts.get($stateParams.id);
                        }]

                }
            });

        $urlRouterProvider.otherwise('home');
    }]);

app.factory('posts', ['$http',function($http){
    var o = {
        posts:[]
    };
    o.getAll = function (/*$http, posts*/) {
        return $http.get('/posts').success(function (data) {     // success() allows to bind function that will be executed when the request returns.
            console.log("success");
            angular.copy(data, o.posts);                        //$scope.posts variable in MainCtrl will also be updated, ensuring new values are reflect in view
        /* $http.get('/someUrl', config).then(successCallback, errorCallback);
         $http.get('/posts').then(function (data) {     // success() allows to bind function that will be executed when the request returns.
             console.log("success");
             angular.copy(data, o.posts);
         }, function (err) {
        */

        })
    };
    o.create = function(post) {
        return $http.post('/posts', post).success(function(data){
            o.posts.push(data);
        });
    };
    o.upvote = function(post) {
        return $http.put('/posts/' + post._id + '/upvote')
            .success(function(data){
                post.upvotes += 1;
            });
    };
    o.addComment = function(id, comment) {
        return $http.post('/posts/' + id + '/comments', comment);
    };
    o.get = function(id) {
        return $http.get('/posts/' + id).then(function(res){
            return res.data;
        });
    };
    o.upvoteComment = function(post, comment) {
        return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
            .success(function(data){
                comment.upvotes += 1;
            });
    };
    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope, posts){
        $scope.posts = posts.posts;
        console.log('here4');
        $scope.addPost = function () {
            if (!$scope.title || $scope.title === ''){return;}
            /*$scope.posts.push({
                title:   $scope.title,
                link:    $scope.link,
                upvotes: 0,
                //mock
                comments: [
                    {author: 'Joe', body: 'Cool post!', upvotes: 0},
                    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
                ]
            });
            */
            posts.create({
                title:   $scope.title,
                link:    $scope.link
            });
            $scope.title = '';
            $scope.link  = '';
        };

        $scope.incrementUpvotes = function(post) {
            posts.upvote(post);
        };
    }]);
app.controller('PostsCtrl', [
    '$scope',
    // '$stateParams',
    'posts',
    'post',
    function ($scope, posts, post ) {
        //id
        // $scope.post = posts.posts[$stateParams.id];
        $scope.post = post;
        $scope.addComment = function () {
            if ($scope.body === '') {return;}

            posts.addComment(post._id, {
                body:   $scope.body,
                author: 'user'
            }).success(function (comment) {
                $scope.post.comments.push(comment);
            });
            /* $scope.post.comments.push({
                 body:   $scope.body,
                 author: 'user',
                 upvotes: 0
             });*/
            $scope.incrementUpvotes = function(comment){
                posts.upvoteComment(post, comment);
            };
            $scope.body = '';
        }
    }
]);