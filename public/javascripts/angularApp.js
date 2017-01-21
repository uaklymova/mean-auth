var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
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
    o.getAll = function () {
        return $http.get('/posts').success(function (data) { // success() allows to bind function that will be executed when the request returns.
            angular.copy(data, o,posts); //$scope.posts variable in MainCtrl will also be updated, ensuring new values are reflect in view
        })
    };

    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope, posts){
        $scope.posts = posts.posts;

        $scope.addPost = function () {
            if (!$scope.title || $scope.title === ''){return;}
            $scope.posts.push({
                title:   $scope.title,
                link:    $scope.link,
                upvotes: 0,
                //mock
                comments: [
                    {author: 'Joe', body: 'Cool post!', upvotes: 0},
                    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
                ]
            });
            $scope.title = '';
            $scope.link  = '';
        };

        $scope.incrementUpvotes = function(post) {
            post.upvotes += 1;
        };
    }]);
app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function ($scope, $stateParams, posts) {
        //id
        $scope.post = posts.posts[$stateParams.id];

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