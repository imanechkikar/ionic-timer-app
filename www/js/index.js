// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

//moment

// Database instance.
var db=null;
var app =angular.module('starter', ['ionic', 'angular-svg-round-progress','ngCordova']);

app.run(function($ionicPlatform,$cordovaSQLite) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      // Important!!
      //
      // Instantiate database file/connection after ionic platform is ready.
      //
      if (window.cordova) {
        db = $cordovaSQLite.openDB({ name: "maBase.db", location: 'default' }); //device
      }
      else{
        db = window.openDatabase("maBase.db", '1', 'maBase',-1); // browser
      }
     // $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS JoursConfiguration  " );
     // $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS Configuration  " );
     // $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS Notification  " );
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Configuration (id INTEGER PRIMARY KEY AUTOINCREMENT, dateDebut TEXT, datefin TEXT, valence NUMERIC , statut NUMERIC )');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS JoursConfiguration (id INTEGER PRIMARY KEY AUTOINCREMENT,idConfig INTEGER , idJour INTEGER ,  FOREIGN KEY(idConfig) REFERENCES Configuration (id))');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Notification (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, idConfig INTEGER ,FOREIGN KEY(idConfig) REFERENCES Configuration (id))');
    //  $cordovaSQLite.execute(db, 'INSERT INTO Jours  IF NOT EXISTS (id,nomJour) VALUES (1,Lundi),(2,Mardi),(3,Mercredi),(4,Jeudi),(5,Vendredi),(6,Samedi),(7,Dimanche)');
    });
  });
app.config(function ($stateProvider,$urlRouterProvider) {
  //creation d'une route "nom " pour chaque vue (tableau -> chemin d acces , )
  $stateProvider.state("Config",{
      url : "/Config",
      templateUrl:"templates/configurationTimer.html",
      controller:"timmerCtrl"
    }
  );

  $stateProvider.state("History",{
      url : "/History",
      templateUrl:"templates/Historique.html",
      controller:"HistoryCtrl"
    }
  );

  // route par defaut

  $urlRouterProvider.otherwise("Config");

});
app.controller('HistoryCtrl',function($scope,$cordovaSQLite){
  // Execute SELECT statement to load message from database.
  $scope.configurations=[];
  $scope.load=function () {
    $cordovaSQLite.execute(db, 'SELECT * FROM Configuration Order by dateDebut DESC ')
      .then(
        function(res) {
          if (res.rows.length > 0) {
            for(var i =0 ;  i<res.rows.length;i++){
              $scope.configurations.push({
                id: res.rows.item(i).id,
                dateDebut: new Date(res.rows.item(i).dateDebut),
                datefin: new Date(res.rows.item(i).datefin),
                statut: res.rows.item(i).statut,
              });
            }
          console.log( "Message loaded successful, cheers!");
          }
        },
        function(error) {
          console.log($scope.statusMessage = "Error on loading: " + error.message);
        }
      );
   };


});



app.controller('timmerCtrl', function($scope, $ionicModal, $timeout, $cordovaSQLite) {

  /*
  etape1 : initialiser la vue
  cette etape permet de visualiser le  boutton 'inisialiser'. ell permet de declencher la fct initial.
  elle permet de recuperer la derniere configuration non terminée de la base de données ainsi de visualiser le button 'continuer'.
  dans le cas écheant , elle visualise seulement le button "commencer"
   */


  $scope.initicier=true;
    $scope.initial= function(){
      // Execute SELECT statement to load message from database.
      $scope.initicier=false;
      $scope.recommencer=true;
      $scope.datestart=new Date();
      $scope.datefin=new Date();
      $scope.cadence=1;
      $scope.idConfig=null;
      $scope.checkedDays=[];
      var query= "SELECT * FROM Configuration where statut = 0 and dateDebut <= '"+ new Date()+"' ORDER BY dateDebut DESC";
      $cordovaSQLite.execute(db, query)
        .then(
          function(res) {
            console.log( query);
            if (res.rows.length > 0) {
              $scope.idConfig = res.rows.item(0).id;
              $scope.datestart =new Date(res.rows.item(0).dateDebut);
              $scope.datefin = new Date(res.rows.item(0).datefin);
              $scope.cadence= res.rows.item(0).valence;

              console.log( " loading: ok " );

              query="SELECT * FROM JoursConfiguration where idConfig= '"+ $scope.idConfig+"'";
              $cordovaSQLite.execute(db, query).then(
                function(res) {
                    console.log( query);
                  if(res.rows.length>0)
                    for (i=0;i < res.rows.length;i++) {

                      $scope.checkedDays.push( res.rows.item(i).idJour);
                    }
                  console.log($scope.checkedDays);

                  },function(error) {
                    console.log( "Error on loading: " + error.message);
                    $scope.idConfig=0;
                  });
            }

          },
          function(error) {
           console.log( "Error on loading: " + error.message);
            $scope.idConfig=0;
          }
        );




   };


   /*
   etape2: Nouvelle Configuration
   les dates sont initialisées à la date courante
   le formulaire de saisie est affiché ainsi l'utilisateur doit entrer sa nouvelle configuration.
   Une fois , il le remplit , il doit cliquer le button 'entrer'
    */

  $scope.Recommencer=function () {
    $scope.recommencer=false;
    $scope.datestart=new Date();
    $scope.datefin=new Date();
    $scope.cadence=1;
    $scope.idConfig=0;
    $scope.Jours = [
      { text: "Lundi", checked: true , value:1},
      { text: "Mardi", checked: false , value:2 },
      { text: "Mercredi", checked: true , value:3 },
      { text: "Jeudi", checked: false , value:4},
      { text: "Vendredi", checked: true , value:5 },
      { text: "Samdi", checked: false , value:6 },
      { text: "Dimanche", checked: false , value:7}
    ];
    $scope.checkedDays=[];

  }


   /*
   etape3 : Running  the timmer
   la fonction qui permet de declencher cet evenement est 'selectTimer'. Elle convertit les variables  dateDebut , dateFin  en var Date .
   ensuite ,elle calcule la durée entre ces deux dates . En plus , elle vérifie la condition suivante:
      -  si la configuration est nouvelle : elle l 'insert dans la base de données et declenche un traitement qui va lancer le timer qd la dateDebut est égale à dateNow.
      - si non  , elle lance le timmer .

    */

  // starts the timer in
  var countDown = function () {

     if ($scope.datestart.toLocaleString() ===new Date().toLocaleString()){
        mytimeout = $timeout($scope.onTimeout, $scope.cadence*1000);
        return;
      }

      $timeout(countDown, 1000);

  }


  /*
  * function de commencer à zero
  */

  $scope.enregistrer=function(datefin,datestart,cadence,Jours) {

    datefin=new Date(datefin);
    datestart=new Date(datestart);

    var val = (datefin - datestart) / 1000;
    $scope.datestart = datestart;
    $scope.datefin = datefin;
    $scope.cadence = cadence;
    $scope.timeForTimer = val;
    $scope.timer = val;
    $scope.done = false;
    $scope.Jours=Jours;

     var checkedDays=[];

    for(var i =0 ; i <$scope.Jours.length ; i++) {
      if ($scope.Jours[i].checked) {
          checkedDays.push($scope.Jours[i].value);
      }
    }

    console.log(checkedDays);

    var query="INSERT INTO JoursConfiguration (idConfig,idJour) VALUES (?,?) ";
     // execute INSERT statement with parameter
      $cordovaSQLite.execute(db, 'INSERT INTO Configuration (dateDebut,datefin,valence,statut) VALUES (?,?,?,?)', [datestart, datefin, cadence,0])
        .then(function (result) {
          console.log("Message saved successful, cheers!" );
          $scope.idConfig=result.insertId;
          for(var i =0 ; i <$scope.Jours.length ; i++){
            if($scope.Jours[i].checked){
               $scope.checkedDays.push($scope.Jours[i].value);
               $cordovaSQLite.execute(db,query,[ $scope.idConfig,$scope.Jours[i].value]).then(function(result) {
                console.log("INSERT ID -> " + result.insertId +"--- "+ $scope.idConfig +" , " +i + " this day : " + new Date().getDay());
              }, function(error) {
                console.error(error);
              });
            }
          }
        }, function (error) {
          console.log("Error on saving: " + error.message);
        });

      $scope.modal.show();

    if(checkedDays.indexOf(new Date().getDay())!=-1){

      countDown();
    }


  }

  /*
   * function de continuer
   */
  $scope.continuer=function(){

    console.log($scope.datefin+" -------------> "+$scope.datestart);

    var val= ($scope.datefin-$scope.datestart)/1000;


    $scope.timeForTimer = val;
    $scope.timer=val;

    if($scope.checkedDays.indexOf(new Date().getDay())!=-1){
      mytimeout = $timeout($scope.onTimeout, $scope.cadence*1000);
    }
    $scope.modal.show();

  }




  /*
   etape4 : Timer is Running
   */
    var mytimeout = null; // the current timeoutID
    // actual timer method, counts down every second, stops on zero
    // functions to control the timer
    $scope.onTimeout = function() {
      if ($scope.timer <= 0 ) {
        $scope.timer=0;
        $scope.$broadcast('timer-stopped', 0);
        $timeout.cancel(mytimeout);
        return;
      }

      $scope.datestart.setSeconds($scope.datestart.getSeconds()+$scope.cadence);
      $scope.timer-=$scope.cadence;
      // execute INSERT the notification

      $cordovaSQLite.execute(db, 'INSERT INTO Notification (date,idConfig) VALUES (?,?)', [$scope.datestart, $scope.idConfig])
        .then(function (result) {
          console.log("Message saved Notification!" + $scope.datestart);
        }, function (error) {
          console.log("Error on saving: " + error.message);
        });

      mytimeout = $timeout($scope.onTimeout, $scope.cadence*1000);
    };

    // triggered, when the timer stops, you can do something here, maybe show a visual indicator or vibrate the device
    $scope.$on('timer-stopped', function(event, remaining) {

      // update the statut of the configuration to 1  ---->  config is terminated
      if (remaining === 0){
       var executeQuery = "UPDATE Configuration SET statut=1 WHERE id='"+ $scope.idConfig+"'; ";
        $cordovaSQLite.execute(db, executeQuery)
          .then(function (result) {
            console.log("Message saved successful, cheers!" + executeQuery);
          }, function (error) {
            console.log("Error on saving: " + error.message +"---"+executeQuery);
          });
        $scope.done = true;
      }

    });

  $scope.stopTimer = function() {

    var executeQuery = "UPDATE Configuration SET dateDebut= '"+$scope.datestart+"' WHERE id='"+ $scope.idConfig+"'; ";
    $cordovaSQLite.execute(db, executeQuery)
      .then(function (result) {
        console.log("Message saved successful, cheers!" + executeQuery);
      }, function (error) {
        console.log("Error on saving: " + error.message +"---"+executeQuery);
      });

    $timeout.cancel(mytimeout);

  };





  $scope.$on('modal.shown', function() {
    console.log('Modal is shown!');
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    if(!$scope.done)      $scope.stopTimer();
    $scope.initicier=true;
    $scope.recommencer=false;
   // if (!$scope.$$phase) $scope.$apply();
  });

  // This function helps to display the time in a correct way in the center of the timer
    $scope.humanizeDurationTimer = function(input, units) {
      // units is a string with possible values of y, M, w, d, h, m, s, ms

            if (input == 0 || input <= 0) {
              return 0;
            }
            else {
              var duration = moment().startOf('day').add(input, units);
              var format = "";




              if (duration.hour() > 0) {
                format += "H[h] ";
              }
              if (duration.minute() > 0) {
                format += "m[m] ";
              }
              if (duration.second() > 0) {
                format += "s[s] ";
              }
              return duration.format(format);
            }


    };
    // function for the modal
    $ionicModal.fromTemplateUrl('templates/timer.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });


  });

/* angular-svg-round-progressbar@0.3.8 2015-10-21 */
"use strict";
! function() {
  for (var a = 0, b = ["webkit", "moz"], c = 0; c < b.length && !window.requestAnimationFrame; ++c) window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"];
  window.requestAnimationFrame || (window.requestAnimationFrame = function(b) {
    var c = (new Date).getTime(),
      d = Math.max(0, 16 - (c - a)),
      e = window.setTimeout(function() {
        b(c + d)
      }, d);
    return a = c + d, e
  }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function(a) {
    window.clearTimeout(a)
  })
}(), angular.module("angular-svg-round-progress", []), angular.module("angular-svg-round-progress").constant("roundProgressConfig", {
  max: 50,
  semi: !1,
  rounded: !1,
  responsive: !1,
  clockwise: !0,
  radius: 100,
  color: "#45ccce",
  bgcolor: "#eaeaea",
  stroke: 15,
  duration: 800,
  animation: "easeOutCubic",
  offset: 0
}), angular.module("angular-svg-round-progress").service("roundProgressService", [function() {
  var a = {},
    b = angular.isNumber,
    c = document.head.querySelector("base");
  a.resolveColor = c && c.href ? function(a) {
    var b = a.indexOf("#");
    return b > -1 && a.indexOf("url") > -1 ? a.slice(0, b) + window.location.href + a.slice(b) : a
  } : function(a) {
    return a
  }, a.isSupported = !(!document.createElementNS || !document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect);
  var d = function(a, b, c, d) {
    var e = (d - 90) * Math.PI / 180;
    return {
      x: a + c * Math.cos(e),
      y: b + c * Math.sin(e)
    }
  };
  return a.toNumber = function(a) {
    return b(a) ? a : parseFloat((a + "").replace(",", "."))
  }, a.getOffset = function(b, c) {
    var d = +c.offset || 0;
    if ("inherit" === c.offset)
      for (var e, f = b; !f.hasClass("round-progress-wrapper");) a.isDirective(f) && (e = f.scope().$parent.getOptions(), d += (+e.offset || 0) + (+e.stroke || 0)), f = f.parent();
    return d
  }, a.updateState = function(a, b, c, e, f, g) {
    if (!f) return e;
    var h = a > 0 ? Math.min(a, b) : 0,
      i = g ? 180 : 359.9999,
      j = 0 === b ? 0 : h / b * i,
      k = f / 2,
      l = d(k, k, c, j),
      m = d(k, k, c, 0),
      n = 180 >= j ? "0" : "1",
      o = ["M", l.x, l.y, "A", c, c, 0, n, 0, m.x, m.y].join(" ");
    return e.attr("d", o)
  }, a.isDirective = function(a) {
    return a && a.length ? "undefined" != typeof a.attr("round-progress") || "round-progress" === a[0].nodeName.toLowerCase() : !1
  }, a.animations = {
    linearEase: function(a, b, c, d) {
      return c * a / d + b
    },
    easeInQuad: function(a, b, c, d) {
      return c * (a /= d) * a + b
    },
    easeOutQuad: function(a, b, c, d) {
      return -c * (a /= d) * (a - 2) + b
    },
    easeInOutQuad: function(a, b, c, d) {
      return (a /= d / 2) < 1 ? c / 2 * a * a + b : -c / 2 * (--a * (a - 2) - 1) + b
    },
    easeInCubic: function(a, b, c, d) {
      return c * (a /= d) * a * a + b
    },
    easeOutCubic: function(a, b, c, d) {
      return c * ((a = a / d - 1) * a * a + 1) + b
    },
    easeInOutCubic: function(a, b, c, d) {
      return (a /= d / 2) < 1 ? c / 2 * a * a * a + b : c / 2 * ((a -= 2) * a * a + 2) + b
    },
    easeInQuart: function(a, b, c, d) {
      return c * (a /= d) * a * a * a + b
    },
    easeOutQuart: function(a, b, c, d) {
      return -c * ((a = a / d - 1) * a * a * a - 1) + b
    },
    easeInOutQuart: function(a, b, c, d) {
      return (a /= d / 2) < 1 ? c / 2 * a * a * a * a + b : -c / 2 * ((a -= 2) * a * a * a - 2) + b
    },
    easeInQuint: function(a, b, c, d) {
      return c * (a /= d) * a * a * a * a + b
    },
    easeOutQuint: function(a, b, c, d) {
      return c * ((a = a / d - 1) * a * a * a * a + 1) + b
    },
    easeInOutQuint: function(a, b, c, d) {
      return (a /= d / 2) < 1 ? c / 2 * a * a * a * a * a + b : c / 2 * ((a -= 2) * a * a * a * a + 2) + b
    },
    easeInSine: function(a, b, c, d) {
      return -c * Math.cos(a / d * (Math.PI / 2)) + c + b
    },
    easeOutSine: function(a, b, c, d) {
      return c * Math.sin(a / d * (Math.PI / 2)) + b
    },
    easeInOutSine: function(a, b, c, d) {
      return -c / 2 * (Math.cos(Math.PI * a / d) - 1) + b
    },
    easeInExpo: function(a, b, c, d) {
      return 0 == a ? b : c * Math.pow(2, 10 * (a / d - 1)) + b
    },
    easeOutExpo: function(a, b, c, d) {
      return a == d ? b + c : c * (-Math.pow(2, -10 * a / d) + 1) + b
    },
    easeInOutExpo: function(a, b, c, d) {
      return 0 == a ? b : a == d ? b + c : (a /= d / 2) < 1 ? c / 2 * Math.pow(2, 10 * (a - 1)) + b : c / 2 * (-Math.pow(2, -10 * --a) + 2) + b
    },
    easeInCirc: function(a, b, c, d) {
      return -c * (Math.sqrt(1 - (a /= d) * a) - 1) + b
    },
    easeOutCirc: function(a, b, c, d) {
      return c * Math.sqrt(1 - (a = a / d - 1) * a) + b
    },
    easeInOutCirc: function(a, b, c, d) {
      return (a /= d / 2) < 1 ? -c / 2 * (Math.sqrt(1 - a * a) - 1) + b : c / 2 * (Math.sqrt(1 - (a -= 2) * a) + 1) + b
    },
    easeInElastic: function(a, b, c, d) {
      var e = 1.70158,
        f = 0,
        g = c;
      return 0 == a ? b : 1 == (a /= d) ? b + c : (f || (f = .3 * d), g < Math.abs(c) ? (g = c, e = f / 4) : e = f / (2 * Math.PI) * Math.asin(c / g), -(g * Math.pow(2, 10 * (a -= 1)) * Math.sin((a * d - e) * (2 * Math.PI) / f)) + b)
    },
    easeOutElastic: function(a, b, c, d) {
      var e = 1.70158,
        f = 0,
        g = c;
      return 0 == a ? b : 1 == (a /= d) ? b + c : (f || (f = .3 * d), g < Math.abs(c) ? (g = c, e = f / 4) : e = f / (2 * Math.PI) * Math.asin(c / g), g * Math.pow(2, -10 * a) * Math.sin((a * d - e) * (2 * Math.PI) / f) + c + b)
    },
    easeInOutElastic: function(a, b, c, d) {
      var e = 1.70158,
        f = 0,
        g = c;
      return 0 == a ? b : 2 == (a /= d / 2) ? b + c : (f || (f = d * (.3 * 1.5)), g < Math.abs(c) ? (g = c, e = f / 4) : e = f / (2 * Math.PI) * Math.asin(c / g), 1 > a ? -.5 * (g * Math.pow(2, 10 * (a -= 1)) * Math.sin((a * d - e) * (2 * Math.PI) / f)) + b : g * Math.pow(2, -10 * (a -= 1)) * Math.sin((a * d - e) * (2 * Math.PI) / f) * .5 + c + b)
    },
    easeInBack: function(a, b, c, d, e) {
      return void 0 == e && (e = 1.70158), c * (a /= d) * a * ((e + 1) * a - e) + b
    },
    easeOutBack: function(a, b, c, d, e) {
      return void 0 == e && (e = 1.70158), c * ((a = a / d - 1) * a * ((e + 1) * a + e) + 1) + b
    },
    easeInOutBack: function(a, b, c, d, e) {
      return void 0 == e && (e = 1.70158), (a /= d / 2) < 1 ? c / 2 * (a * a * (((e *= 1.525) + 1) * a - e)) + b : c / 2 * ((a -= 2) * a * (((e *= 1.525) + 1) * a + e) + 2) + b
    },
    easeInBounce: function(b, c, d, e) {
      return d - a.animations.easeOutBounce(e - b, 0, d, e) + c
    },
    easeOutBounce: function(a, b, c, d) {
      return (a /= d) < 1 / 2.75 ? c * (7.5625 * a * a) + b : 2 / 2.75 > a ? c * (7.5625 * (a -= 1.5 / 2.75) * a + .75) + b : 2.5 / 2.75 > a ? c * (7.5625 * (a -= 2.25 / 2.75) * a + .9375) + b : c * (7.5625 * (a -= 2.625 / 2.75) * a + .984375) + b
    },
    easeInOutBounce: function(b, c, d, e) {
      return e / 2 > b ? .5 * a.animations.easeInBounce(2 * b, 0, d, e) + c : .5 * a.animations.easeOutBounce(2 * b - e, 0, d, e) + .5 * d + c
    }
  }, a
}]), angular.module("angular-svg-round-progress").directive("roundProgress", ["$window", "roundProgressService", "roundProgressConfig", function(a, b, c) {
  var d = {
    restrict: "EA",
    replace: !0,
    transclude: !0,
    scope: {
      current: "=",
      max: "=",
      semi: "=",
      rounded: "=",
      clockwise: "=",
      responsive: "=",
      radius: "@",
      color: "@",
      bgcolor: "@",
      stroke: "@",
      duration: "@",
      animation: "@",
      offset: "@"
    }
  };
  return b.isSupported ? angular.extend(d, {
    link: function(e, f) {
      var g, h, i = !f.hasClass("round-progress-wrapper"),
        j = i ? f : f.find("svg").eq(0),
        k = j.find("path").eq(0),
        l = j.find("circle").eq(0),
        m = angular.copy(c);
      e.getOptions = function() {
        return m
      };
      var n = function() {
          var a = m.semi,
            c = m.responsive,
            d = +m.radius || 0,
            e = +m.stroke,
            g = 2 * d,
            h = d - e / 2 - b.getOffset(f, m);
          j.css({
            top: 0,
            left: 0,
            position: c ? "absolute" : "static",
            width: c ? "100%" : g + "px",
            height: c ? "100%" : (a ? d : g) + "px",
            overflow: "hidden"
          }), i || (j[0].setAttribute("viewBox", "0 0 " + g + " " + (a ? d : g)), f.css({
            width: c ? "100%" : "auto",
            position: "relative",
            "padding-bottom": c ? a ? "50%" : "100%" : 0
          })), f.css({
            width: c ? "100%" : "auto",
            position: "relative",
            "padding-bottom": c ? a ? "50%" : "100%" : 0
          }), k.css({
            stroke: b.resolveColor(m.color),
            "stroke-width": e,
            "stroke-linecap": m.rounded ? "round" : "butt"
          }), a ? k.attr("transform", m.clockwise ? "translate(0," + g + ") rotate(-90)" : "translate(" + g + ", " + g + ") rotate(90) scale(-1, 1)") : k.attr("transform", m.clockwise ? "" : "scale(-1, 1) translate(" + -g + " 0)"), l.attr({
            cx: d,
            cy: d,
            r: h >= 0 ? h : 0
          }).css({
            stroke: b.resolveColor(m.bgcolor),
            "stroke-width": e
          })
        },
        o = function(c, d, e) {
          var h = b.toNumber(m.max || 0),
            i = c > 0 ? a.Math.min(c, h) : 0,
            j = d === i || 0 > d ? 0 : d || 0,
            l = i - j,
            n = b.animations[m.animation],
            o = new a.Date,
            p = +m.duration || 0,
            q = e || c > h && d > h || 0 > c && 0 > d || 25 > p,
            r = m.radius,
            s = r - m.stroke / 2 - b.getOffset(f, m),
            t = 2 * r,
            u = m.semi;
          q ? b.updateState(i, h, s, k, t, u) : (a.cancelAnimationFrame(g), function v() {
            var c = a.Math.min(new Date - o, p);
            b.updateState(n(c, j, l, p), h, s, k, t, u), p > c && (g = a.requestAnimationFrame(v))
          }())
        },
        p = Object.keys(d.scope).filter(function(a) {
          return "current" !== a
        });
      e.$watchGroup(p, function(a) {
        for (var b = 0; b < a.length; b++) "undefined" != typeof a[b] && (m[p[b]] = a[b]);
        n(), e.$broadcast("$parentOffsetChanged"), "inherit" !== m.offset || h ? "inherit" !== m.offset && h && h() : h = e.$on("$parentOffsetChanged", function() {
          o(e.current, e.current, !0), n()
        })
      }), e.$watchGroup(["current", "max", "animation", "duration", "radius", "stroke", "semi", "offset"], function(a, c) {
        o(b.toNumber(a[0]), b.toNumber(c[0]))
      })
    },
    template: function(a) {
      for (var c = a.parent(), d = "round-progress", e = ['<svg class="' + d + '" xmlns="http://www.w3.org/2000/svg">', '<circle fill="none"/>', '<path fill="none"/>', "<g ng-transclude></g>", "</svg>"]; c.length && !b.isDirective(c);) c = c.parent();
      return c && c.length || (e.unshift('<div class="round-progress-wrapper">'), e.push("</div>")), e.join("\n")
    }
  }) : angular.extend(d, {
    template: '<div class="round-progress" ng-transclude></div>'
  })
}]);
