const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
const http = require('http');
const axios = require('axios');



const app=express();

app.listen(3000,function(){
  console.log("Server is up and running and all good");
});

app.get("/",function(req,res){

  ip='124.253.30.7'; //put ip=req.ip
  url='http://ip-api.com/json/'+ip;

  console.log(url);

  http.get(url,function(res){
    res.on("data",function(data){
      let locinfo=JSON.parse(data);

      city=locinfo.city;

      console.log(city);

      url2='https://indian-cities-api-nocbegfhqg.now.sh/cities?City_like='+city;

      https.get(url2,function(res2){

        res2.on("data",function(data){
          let cityarr=JSON.parse(data);
          superdistrict=cityarr[0].District;
          superstate=cityarr[0].State;

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
        let states=result.data.data.country.states;

        states.forEach(function(state){
          if(state.state==superstate)
          {
             districts=state.districts;
             districts.forEach(function(district){
               if(district.district==superdistrict)
               {
                 console.log(district.cases);
               }
             })
          }
        })

      });












        })
      })


    })
  })







});
