import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // Map Object
  public myMap!: L.Map;

  // form model
  public myForm = new FormGroup({
    Name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
    ]),
    Message: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(256),
    ]),
  });

  // submitting form
  public formSubmitting: boolean = false;

  // Api Url
  private _apiUrl: string =
    window.location.hostname == 'localhost'
      ? 'http://localhost:5000/api/v1/messages'
      : 'Production_URL';

  // Variable to store Messages
  public messages: IFormData[] = [];

  // latitude & longitude
  public latitude: number = 0;
  public longitude: number = 0;

  //Icons Urls
  public userIconUrl: string = 'assets/icons8-marker-96.png';
  public shadowUrl: string = 'assets/marker-shadow.png';
  public friendsIconUrl: string = 'assets/marker-icon.png';

  // User Marker Icon
  public userIcon = L.icon({
    iconUrl: this.userIconUrl,
    shadowUrl: this.shadowUrl,
    iconSize: [40, 40], // size of the icon
    shadowSize: [30, 30], // size of the shadow
    iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
    shadowAnchor: [-10, 0], // the same for the shadow
    popupAnchor: [20, 0], // point from which the popup should open relative to the iconAnchor
  });

  // friends Marker Icon
  public friendsIcon = L.icon({
    iconUrl: this.friendsIconUrl,
    shadowUrl: this.shadowUrl,
    iconSize: [20, 20], // size of the icon
    shadowSize: [20, 20], // size of the shadow
    iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
    shadowAnchor: [-5, 0], // the same for the shadow
    popupAnchor: [10, 0], // point from which the popup should open relative to the iconAnchor
  });

  // Update Map after getting Location of user
  private _update(latitude: number, longitude: number): void {
    this.myMap.remove();
    this.myMap = L.map('mapId').setView([latitude, longitude], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.myMap);
    L.marker([latitude, longitude], { icon: this.userIcon }).addTo(this.myMap);

    this.messages.forEach((e) => {
      L.marker([e.latitude, e.longitude], { icon: this.friendsIcon })
        .addTo(this.myMap)
        .bindPopup(`<em>${e.userName}</em>:${e.Message}`);
    });
  }

  // form submit function
  public onSubmit(event: any): void {
    event.preventDefault();
    console.log(this.myForm.value);
    const userMessage = {
      userName: this.myForm.value.Name,
      Message: this.myForm.value.Message,
      latitude: this.latitude,
      longitude: this.longitude,
    };
    if (this.myForm.valid) {
      this.formSubmitting = true;
      fetch(this._apiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(userMessage),
      })
        .then((res) => res.json())
        .then((insertedMessage) => console.log(insertedMessage));

      this.myForm.reset();
      setTimeout(() => {
        this.formSubmitting = false;
      }, 2500);
    }
  }

  // function to get all messages
  private _getAllMessages(): void {
    fetch(this._apiUrl)
      .then((res) => res.json())
      .then((messages) => {
        this.messages = messages;
        console.log(this.messages);
      });
  }

  ngOnInit(): void {
    this.myMap = L.map('mapId').setView([0, 0], 1);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.myMap);
    this.getLocation();
    this._getAllMessages();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position) {
            console.log(
              'Latitude: ' +
                position.coords.latitude +
                'Longitude: ' +
                position.coords.longitude
            );
            setTimeout(() => {
              (this.latitude = position.coords.latitude),
                (this.longitude = position.coords.longitude),
                this._update(
                  position.coords.latitude,
                  position.coords.longitude
                );
            }, 1500);
          }
        },
        (error) => {
          console.log(error);
          fetch('http://ip-api.com/json/', { mode: 'cors' })
            .then((res) => res.json())
            .then((location) => {
              console.log(location);
              setTimeout(() => {
                (this.latitude = location.lat),
                  (this.longitude = location.lon),
                  this._update(location.lat, location.lon);
              }, 1500);
            });
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
}

// Interface for Data Model
export interface IFormData {
  userName: string;
  Message: string;
  date: Date;
  latitude: number;
  longitude: number;
  _id: string;
}
