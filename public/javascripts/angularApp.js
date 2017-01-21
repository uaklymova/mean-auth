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
            })
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    }
                }]
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
app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};
    auth.saveToken = function (token){
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function (){
        return $window.localStorage['flapper-news-token'];
    };
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function(){
        $window.localStorage.removeItem('flapper-news-token');
    };


    return auth;
}]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope, posts){
        $scope.posts = posts.posts;
        console.log('here4');
        $scope.addPost = function () {
            if (!$scope.title || $scope.title === ''){return;}
            /*
             it was first step - BEFORE creating func
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
            /*it was first step - BEFORE creating func
             $scope.post.comments.push({
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
app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};

        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
    }]);