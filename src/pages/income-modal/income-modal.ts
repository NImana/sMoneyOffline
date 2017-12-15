import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController,Platform } from 'ionic-angular';
import { SqlitedbProvider } from '../../providers/sqlitedb/sqlitedb';

/**
 * Generated class for the IncomeModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-income-modal',
  templateUrl: 'income-modal.html',
})
export class IncomeModalPage {

action: string = this.navParams.get('action');
typeid: string = this.navParams.get('typeid');
title: string = this.navParams.get('title');
monthlyamount: string = this.navParams.get('monthlyamount');
startdate: string = this.navParams.get('startdate');
enddate: string = this.navParams.get('enddate');
monthlypaymentday: string = this.navParams.get('monthlypaymentday');
paymenttype: string = this.navParams.get('paymenttype');
bankname: string = this.navParams.get('bankName');
maxTansactionID:number = Number(this.navParams.get('maxTansactionID'));
maxIncomeID:string = this.navParams.get('maxIncomeID');
originalamount=this.monthlyamount;
originalStartDate=this.startdate;
originalEndDate=this.enddate;
trackingCount=0;
originalyears=0;
maxID :any;
newID =0;
dayOfMonth:any = this.navParams.get('dayOfMonth');
banknamehiddenstate:boolean = this.paymenttype==='' || this.paymenttype==='Pay by Cash'?true:false;
status = false;
	constructor(
				public navCtrl: NavController, 
				public navParams: NavParams,
				public viewCtrl: ViewController,
				public smoneydb: SqlitedbProvider,
				public alertCtrl: AlertController,
				public platform: Platform) {
		platform.ready().then(() => {
			  //Registration of push in Android and Windows Phone
			  platform.registerBackButtonAction(() => {
				  this.viewCtrl.dismiss();
			  });
		});
	}
	ionViewDidLoad() {
	console.log('ionViewDidLoad IncomeModalPage');
	}
	createIncome(incomeDay){
		this.maxIncomeID=this.maxIncomeID+1;
		var data = [this.maxIncomeID,this.title,this.monthlyamount,Date.parse(this.startdate),Date.parse(this.enddate),incomeDay,this.paymenttype,this.bankname,''];
		this.smoneydb.addData('Incomes','(?,?,?,?,?,?,?,?,?)', data);
		this.maxTansactionID = this.smoneydb.createTrackingDetails(this.maxTansactionID,this.maxIncomeID,'Income',new Date(this.startdate),new Date(this.enddate),incomeDay,this.monthlyamount,this.bankname,'create');
		this.status=true;
		this.viewCtrl.dismiss([this.status,this.trackingCount]);
	}
	updateIncome(incomeDay){
		var nsd,ned,osd,oed;
		nsd=Date.parse(this.startdate);ned=Date.parse(this.enddate);
		osd=Date.parse(this.originalStartDate);oed=Date.parse(this.originalEndDate);
		if (nsd>osd){
			this.smoneydb.cleanTrackingDetails(this.typeid,'Income',new Date(nsd),'<');
		}
		if (ned<oed){
			this.smoneydb.cleanTrackingDetails(this.typeid,'Income',new Date(ned),'>');
		}
		if (nsd<osd){
			this.status=true;
			this.maxTansactionID = this.smoneydb.createTrackingDetails(this.maxTansactionID,this.typeid,'Income',new Date(this.startdate),new Date(osd),incomeDay,this.monthlyamount,this.bankname,'updatestart');
		}
		if (ned>oed){
			this.status=true;
			this.maxTansactionID = this.smoneydb.createTrackingDetails(this.maxTansactionID,this.typeid,'Income',new Date(oed),new Date(this.enddate),incomeDay,this.monthlyamount,this.bankname,'updateend');
		}
		if (this.originalamount!=this.monthlyamount){
			this.smoneydb.updateTransactionData('amount=?',[this.monthlyamount,this.typeid,'Income']);
		}
		var data = [this.title,this.monthlyamount,nsd,ned,incomeDay,this.paymenttype,this.bankname,this.typeid];
		this.smoneydb.updateData('Incomes','title=?,monthlyamount=?,startdate=?,enddate=?,monthlypaymentday=?,paymenttype=?,bankName=?', data);
		this.viewCtrl.dismiss([true,this.trackingCount]);
		
	}
	saveIncome(){
	this.monthlyamount = this.monthlyamount.toString()==='' ? '0' : this.monthlyamount; //set income amount not empty
	this.paymenttype = this.paymenttype.toString()==='' ? 'Pay by Cash' : this.paymenttype; //set default payment method    
	var incomeDay = this.smoneydb.getpaymentDay(this.startdate,this.monthlypaymentday);
	this.trackingCount=new Date(this.enddate).getFullYear()-new Date(this.startdate).getFullYear();
	this.originalyears=new Date(this.originalEndDate).getFullYear()-new Date(this.originalStartDate).getFullYear();
	this.trackingCount=this.trackingCount==0?12:this.trackingCount*12;
	this.originalyears=this.originalyears==0?12:this.originalyears*12;
	this.trackingCount=this.trackingCount<this.originalyears?this.originalyears+1:this.trackingCount+1;
	if (this.title!='') {
	  switch (this.action){
		case 'Create' : {this.createIncome(incomeDay);break; }
		case 'Update' : {this.updateIncome(incomeDay);break; }
		default : {break;}
	  }	
	}
	else {
	  let prompt = this.alertCtrl.create({
		  title: 'Income Title is empty!',
		  message: 'Please provide income title or touch at "Cancel" button to dismiss',
		  buttons: [{text: 'Continue edit this Income'},{ text: 'Cancel',handler: data => {this.viewCtrl.dismiss();}}]});
	  prompt.present();
	}
	}
	deleteIncome(){
		if (this.action==='Create'){
			this.viewCtrl.dismiss([false,1]);
		}else{
			let prompt = this.alertCtrl.create({
			  title: 'Removing Record...',
			  message: 'Are you sure? Action cannot be undone!' ,
			  buttons: [
				{
				  text: 'Cancel'
				},
				{
				  text: 'Delete',
				  handler: data => {
				  this.smoneydb.deleteData('Incomes',this.typeid,'');
				  this.smoneydb.deleteData('Tracking',this.typeid,'Income');
				  this.smoneydb.deleteData('sMoneyOffline',this.typeid,'Income');
					this.trackingCount=new Date(this.enddate).getFullYear()-new Date(this.startdate).getFullYear();
					this.trackingCount=this.trackingCount==0?12:this.trackingCount*12;
				  this.viewCtrl.dismiss([true,this.trackingCount]);
				  }
				}
			  ]
			});
			prompt.present();
		}
	}
	onstartDateChange(){
		this.enddate=Date.parse(this.startdate)>Date.parse(this.enddate)?this.startdate:this.enddate;
	}
	onendDateChange(){
		this.startdate=Date.parse(this.startdate)>Date.parse(this.enddate)?this.enddate:this.startdate;
	}
	onPaymentTypeChange(){
		this.banknamehiddenstate=this.paymenttype==='Scheduled online banking payment'?false:true;
		this.bankname=this.paymenttype==='Pay by Cash'?'Cash':this.bankname==='Cash'?'':this.bankname;		
	}
	closeModal() {
	this.viewCtrl.dismiss();
	}
	

}
