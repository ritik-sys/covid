const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require('axios').default;
const ejs = require("ejs");
const lodash = require("lodash");


const URL = "https://api.covid19api.com/summary";
const URL2 = "https://coronavirus-19-api.herokuapp.com/countries";
const url5="https://api.covid19india.org/v2/state_district_wise.json"
const url4="http://covid19-india-adhikansh.herokuapp.com/states"
const url3="https://api.covid19india.org/data.json"

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//****************************
var labele = [];
var piedata2 = [];
var top_gnames = [];
var global_top_card_data;
var top_gcountry = [];
var usedtop_gcountry = [];
var top_grecover = [];
var top_gconfirmed = [];
var top_gdeaths = [];
var perMillionCases = [];
var perMillionCasesCountry=[];
var specific_india_top_card_data = [];
const india_top_card_data = [];
var india_top_card_data_new=[];
var timeline = [];
//******************************
var india_data = [];
var india_updates=[];
//***************************
app.get("/", function(req, res) {
  axios.get("https://corona.lmao.ninja/v2/historical/all")
    .then(function(response) {
      timeline = response.data;
    })
    .catch(function(error) {
      console.log(error);
    })
  // ----------------------------------------------------
  axios.get(URL2)
    .then(function(response) {
      global_top_card_data = response.data[0];
      for (var i = 0; i < 11; i++) {
        perMillionCases.push(response.data[i]);
        perMillionCasesCountry.push(response.data[i].country);
      }

    //  console.log(perMillionCases); //do not delete this
      console.log(perMillionCasesCountry[3]);
    })
    .catch(function(error) {
      console.log(error);
    })

  axios.get("https://api.covid19india.org/data.json")
    .then(function(response){
      india_top_card_data_new = response.data.statewise[0];
    })
    .catch(function(error){
      console.log(error);
    })

  axios.get(URL)
    .then(function(response) {
      var india_top_card_date = response.data.Countries;
      india_top_card_date.forEach(function(item) {
        if (item.Country === "India") {
          specific_india_top_card_data = item;
        }
      })
      top_gcountry = india_top_card_date;
      top_gcountry.sort(function(a, b) {
        return b.TotalConfirmed - a.TotalConfirmed
      });
      for (var i = 0; i < 5; i++) {
        piedata2.push(top_gcountry[i]);
      }
      for (var i = 0; i < 10; i++) {
        usedtop_gcountry.push(top_gcountry[i]);
        top_gconfirmed.push(top_gcountry[i].TotalConfirmed);
        top_grecover.push(top_gcountry[i].TotalRecovered);
        top_gdeaths.push(top_gcountry[i].TotalDeaths);
      }
      res.render("index", {
        global_top_card_data: global_top_card_data,
        forindia: specific_india_top_card_data,
        india_top_card_data: india_top_card_date,
        india_top_card_data_new:india_top_card_data_new,
        piedata: piedata2,
        perMillionCases: perMillionCases,
        perMillionCasesCountry:perMillionCasesCountry,
        bar_confirm: top_gconfirmed,
        bar_recover: top_grecover,
        bar_death: top_gdeaths,
        bar_name: usedtop_gcountry,
        timeline: timeline
      })
    })
    .catch(function(error) {
      console.log(error);
    });
});

//*********************************
app.get("/india", function(req, res) {

    axios.get("https://api.covid19india.org/updatelog/log.json")
    .then(function(response){
      india_updates=response.data;
      india_updates.reverse();
    })
  axios.get("https://api.covid19india.org/data.json")
    .then(function(response) {

      india_data = response.data.statewise;
      india_data_tested=response.data.tested;
      india_data_timeline=response.data.cases_time_series;

    })

    var district_data=[];
    var modal_data=[];
    var district_modal_data=[];
    var district_code=[];
    var index=0;
    axios.get(url5).then(function(response){
      district_modal_data=(response.data);
      axios.get(url4).then(function(response){
          modal_data=(response.data);
          axios.get(url3).then(function(response){
              district_data=(response.data.statewise);
              district_data.sort(function(a,b){return b.confirmed-a.confirmed});

              res.render("india",{district:district_data,modal_data:modal_data,district_modal_data:district_modal_data,index:index,  india_data: india_data, india_data_tested:india_data_tested,india_updates:india_updates,india_data_timeline:india_data_timeline});
            })
        })
      })
      .catch(function(err){
        console.log(err);
      });



})

app.get("/about",function(req,res){
res.render("about");
})

app.post("/india-stats/district",function(req,res){
  var state = req.body;
  var t_name=[];
  var t_confirm=[];
  var t_death=[];
  var t_recover=[];
  var rt_name=[];
  var rt_confirm=[];
  var rt_death=[];
  var rt_recover=[];
  state=Object.keys(state)[0];
  var required=[];
  var temp=[];
  var transfer_district_data=[];
  axios.get(url5).then(function(response){
    temp=response.data;
    temp.forEach(function(district){
      if(district.state===state){
        transfer_district_data=district;
      }
    })
    transfer_district_data.districtData.sort(function(a,b){return b.confirmed-a.confirmed});
    transfer_district_data.districtData.forEach(function(district){
      t_name.push(district.district);
      t_confirm.push(district.confirmed);
      t_death.push(district.deceased);
      t_recover.push(district.recovered);
    })
    for(var i=0;i<10;i++){
      rt_confirm.push(t_confirm[i]);
      rt_name.push(t_name[i]);
      rt_death.push(t_death[i]);
      rt_recover.push(t_recover[i]);
    }
    console.log(t_name);
    res.render("district",{districts:transfer_district_data,names:rt_name,confirmed:rt_confirm,deaths:rt_death,recover:rt_recover})
  })

});




app.listen(process.env.PORT || 3000, function() {
  console.log("server up at 3000");
});
