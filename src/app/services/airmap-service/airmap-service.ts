import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable()

export class AirmapService {

  api_key: string;
  constructor(private http: HttpClient) {
    //this.addAirMapLayers();
    this.api_key = environment.Airmap.config.airmap.api_key

  }

  getAirMapConfig(): any {
    return environment.Airmap.config;
  }

  // getWeather() {

  //     //Headers for HTTP request
  //     const headers = {
  //         "accept": "application/json",
  //         "x-api-key": this.api_key
  //     };

  //     //Get the weather data and print temperature
  //     this.http.get<any>("https://api.airmap.com/advisory/v2/weather/?longitude=42.087261&latitude=-87.715332", { headers }).subscribe(info => {
  //         this.weather = info;
  //         console.log(this.weather.data.weather[0].temperature);
  //     });

  // }

  // getRulesets(airGeo: any) {

  //     //Headers for HTTP request
  //     const headers = {
  //         "accept": "application/json",
  //         "x-api-key": this.api_key,
  //         "content-type": "application/json"
  //     };

  //     //Need to turn goeJson into a string, but not working...
  //     let body = JSON.stringify(airGeo);

  //     //Temporary string to pass to POST call
  //     let test = "{\"geometry\":\"{   \\\"type\\\": \\\"Feature\\\",   \\\"geometry\\\": {     \\\"type\\\": \\\"Point\\\",     \\\"coordinates\\\": [-87.71240869712065, 42.09047189498622]   },   \\\"properties\\\": {     \\\"name\\\": \\\"Test point\\\"   } }\"}";

  //     //Post the data and get back the rulesets for the geomtry
  //     this.http.post<any>("https://api.airmap.com/rules/v1/", test, { headers }).subscribe(data => {
  //         console.log(data);
  //     });
  // }


  // getAlerts() {
  //     const headers = {
  //         "accept": "application/json",
  //         "x-api-key": this.api_key,
  //         "content-type": "application/json"
  //     };

  //     let url = "https://api.airmap.com/advisory/v2/airspace";

  //     let test = "{\"geometry\":\"{   \\\"type\\\": \\\"Feature\\\",   \\\"geometry\\\": {     \\\"type\\\": \\\"Point\\\",     \\\"coordinates\\\": [-87.71240869712065, 42.09047189498622]   },   \\\"properties\\\": {     \\\"name\\\": \\\"Test point\\\"   } }\"}";
  //     this.http.post<any>(url, test, { headers }).subscribe(data => {
  //         console.log(data);
  //     })
  // }
}
