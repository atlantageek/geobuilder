import { Injectable } from '@angular/core';
import {signal} from '@angular/core'; 
@Injectable({
  providedIn: 'root'
})
export class CommService {
  selectedArea = signal(null);
  constructor() { }
}
