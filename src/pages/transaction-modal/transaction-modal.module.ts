import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransactionModalPage } from './transaction-modal';

@NgModule({
  declarations: [
    TransactionModalPage,
  ],
  imports: [
    IonicPageModule.forChild(TransactionModalPage),
  ],
})
export class TransactionModalPageModule {}
