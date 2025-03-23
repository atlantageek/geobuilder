import { Component } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import 'leaflet-area-select';
import { CommService } from '../../services/comm.service';


@Component({
  selector: 'app-map',
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  standalone: true,
  styleUrl: './map.component.css'
})
export class MapComponent {
  title = 'geobuilder';
  map!: L.Map;
  options = {
    layers: [
      //tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      L.tileLayer.wms('http://10.0.0.231/mapserver?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&MAP=%2Fusr%2Flocal%2Fbasemaps%2Fosm-default.map',{layers:'default'})
    ],
    zoom: 5,
    center: L.latLng(46.879966, -121.726909)
  };

  layersControl = {
    baseLayers: {
      'Open Street Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Open Cycle Map': L.tileLayer('https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'wms Layer': L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-OSM-WMS'
      }),
      'local layer': L.tileLayer.wms('http://10.0.0.231/mapserver?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&MAP=%2Fusr%2Flocal%2Fbasemaps%2Fosm-default.map',{layers:'default'})
    },
    overlays: {
      'Big Circle': L.circle([ 33.75, -84 ], { radius: 5000 }),
      'Big Square': L.polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
    }
  }
  selectArea: any;

  constructor(private _commService: CommService) {
    

  }
  onMapReady(map:L.Map): void {
    this.map = map;
    this.selectArea = new (L.Map as any).SelectArea(this.map);
    this.selectArea.enable();
    console.log("selectArea enabled");
    this.map.on('selectarea:selected', (e: any) => {
      const bounds = e.bounds;
      console.log('Selected area bounds:', bounds.toBBoxString()); //lon, lat, lon, lat
      this._commService.selectedArea.set(bounds);
      // Do something with the bounds, e.g., store them or use them to filter data
    });
    //this.selectArea.setControlKey(true); // Enables selection only when Ctrl key is pressed
    this.selectArea.setShiftKey(true);  // Enables selection only when Shift key is pressed
  }

  onMouseDown(event: any) {
    console.log('Mouse down:', event);
  }
  onMouseUp(event: any) {
    console.log('Mouse up:', event);
  }
  onMouseMove(event: any) {
    console.log('Mouse move:', event);
  }
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
