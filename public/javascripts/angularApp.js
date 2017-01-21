var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        console.log('here1');

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
                controller: 'PostsCtrl'
            });

        $urlRouterProvider.otherwise('home');
    }]);

app.factory('posts', ['$http',function($http){
    var o = {
        posts:[]
    };
    o.getAll = function (/*$http, posts*/) {
        // return $http.get('/posts').success(function (data) {     // success() allows to bind function that will be executed when the request returns.
        //     console.log("success");
        //     angular.copy(data, o.posts);                        //$scope.posts variable in MainCtrl will also be updated, ensuring new values are reflect in view
        // $http.get('/someUrl', config).then(successCallback, errorCallback);
        $http.get('/posts').then(function (data) {     // success() allows to bind function that will be executed when the request returns.
            console.log("success");
            angular.copy(data, o.posts);
        }, function (err) {
            console.log("error");

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
    '$stateParams',
    'posts',
    function ($scope, $stateParams, posts) {
        //id
        $scope.post = posts.posts[$stateParams.id];
        console.log('here5');
        $scope.addComment = function () {
            if ($scope.body === '') {return;}

            $scope.post.comments.push({
                body:   $scope.body,
                author: 'user',
                upvotes: 0
            });
            $scope.body = '';
        }
    }
]);