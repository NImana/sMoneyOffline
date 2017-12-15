import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IncomeModalPage } from './income-modal';

@NgModule({
  declarations: [
    IncomeModalPage,
  ],
  imports: [
    IonicPageModule.forChild(IncomeModalPage),
  ],
})
export class IncomeModalPageModule {}
