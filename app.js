const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
const http = require('http');
const axios = require('axios');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('83cb4a7eaa5c43a7b869d0f401b9bc82');

const app = express();


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view-engine', 'ejs');

var lat, lon;

app.listen(3000, function() {
  console.log("Server is up and running and all good");
});

app.get("/news", function(res, req) {

  // To query /v2/top-headlines
  // All options passed to topHeadlines are optional, but you need to include at least one of them
  newsapi.v2.topHeadlines({



    category: 'health',
    country: 'in'
  }).then(response => {


    req.render("news.ejs", {
      desc: response.articles
    });
    /*
      {
        status: "ok",
        articles: [...]
      }
    */
  });


});

app.get("/", function(req, resinitial) {

ip = '43.230.64.142'; //put ip=req.ip
url = 'http://ip-api.com/json/' + ip;

console.log(url);

http.get(url, function(res) {
  res.on("data", function(data) {
    let locinfo = JSON.parse(data);

    let city = locinfo.city;

    lat = locinfo.lat;
    lon = locinfo.lon;






    url2 = 'https://indian-cities-api-nocbegfhqg.now.sh/cities?City_like=' + city + '&State_like=' + locinfo.regionName;
    console.log(url2);

    https.get(url2, function(res2) {

      res2.on("data", function(data) {
        let cityarr = JSON.parse(data);

        if (cityarr[0] == undefined) {

          resinitial.render("home.ejs", {
            city: 'undefined',
            cases: 'undefined'
          });

        }

        superdistrict = cityarr[0].District;
        superstate = cityarr[0].State;



        axios({
          url: 'https://covidstat.info/graphql',
          method: 'post',
          data: {
            query: `
                                    query {
                    country(name: "India") {
                      states {
                        state
                        districts {
                          district
                          cases
                          todayCases
                          deaths
                          todayDeaths
                          recovered
                          todayRecovered
                          active
                        }
                      }
                    }
                  }
                    `
          }
        }).then((result) => {
          let states = result.data.data.country.states;

          let flag = 0;

          states.forEach(function(state) {
            if (state.state == superstate) {
              districts = state.districts;
              districts.forEach(function(district) {
                if (district.district == superdistrict) {
                  console.log(city + district.cases); //from here continue for the frontend

                  resinitial.render("home.ejs", {
                    city: city,
                    cases: district.cases,
                    deaths: district.deaths,
                    recovered:district.recovered,
                    active:district.active,
                    error:false

                  });
                  flag = 1;

                }
              })
            }
          })


          if (flag == 0) {
            resinitial.render("home.ejs", {
              city: "We are not able to fetch your city, sorry for the inconvenience caused",
              cases: district.cases,
              deaths: district.deaths,
              recovered:district.recovered,
              active:district.active,
              error:true
            });
          }

        });



      });









    })
  })




})




});

app.get("/eat", function(req, response) {

  if (lat == undefined && lon == undefined) {
    response.redirect("/");
  }

  console.log(lat + ',' + lon);


  let urleat = 'https://developers.zomato.com/api/v2.1/geocode?' + 'lat=' + lat + '&lon=' + lon;
  let key = 'd2a876cbab3db2e2ef6ff67b407289ef';
  //let urleat='https://developers.zomato.com/api/v2.1/categories';




  let options = {
    'headers': {
      'user-key': key
    }
  };


  axios({
    method: 'get',
    url: urleat,

    headers: {
      'user-key': key
    }


  }).then(function(res) {
    restaurants = res.data.nearby_restaurants;
    response.render("eat.ejs", {
      restaurants: restaurants
    });



  }).catch(function(res) {
    console.log("error");
  })








});
