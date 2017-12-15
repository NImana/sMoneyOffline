import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrackingModalPage } from './tracking-modal';

@NgModule({
  declarations: [
    TrackingModalPage,
  ],
  imports: [
    IonicPageModule.forChild(TrackingModalPage),
  ],
})
export class TrackingModalPageModule {}
