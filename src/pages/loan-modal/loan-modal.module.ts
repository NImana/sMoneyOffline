import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoanModalPage } from './loan-modal';

@NgModule({
  declarations: [
    LoanModalPage,
  ],
  imports: [
    IonicPageModule.forChild(LoanModalPage),
  ],
})
export class LoanModalPageModule {}
