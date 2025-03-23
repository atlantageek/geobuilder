import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import {signal,effect} from '@angular/core'
import { CommService } from './services/comm.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,MapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'geobuilder';
  area_selected = null;
  constructor(private _commService: CommService) {
    effect(() => {
      this.area_selected = _commService.selectedArea();
      console.log('Selected area found:', _commService.selectedArea());
    })
  }
  openDialog() {

  }
}


