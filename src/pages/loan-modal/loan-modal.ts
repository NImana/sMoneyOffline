import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController,Platform } from 'ionic-angular';
import { SqlitedbProvider } from '../../providers/sqlitedb/sqlitedb';
import { LocalNotifications } from '@ionic-native/local-notifications';
import * as moment from 'moment';
/**
* Generated class for the LoanModalPage page.
*
* See http://ionicframework.com/docs/components/#navigation for more info
* on Ionic pages and navigation.
*/
@IonicPage()
@Component({
	selector: 'page-loan-modal',
	templateUrl: 'loan-modal.html',
})
export class LoanModalPage {
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
maxLoanID:string = this.navParams.get('maxLoanID');
notificationTime:string = this.navParams.get('notificationTime');
notificationDaysBefore:string = this.navParams.get('notificationDaysBefore');
notificationstates:boolean = this.navParams.get('notificationstates');
originalamount=this.monthlyamount;
originalStartDate=this.startdate;
originalEndDate=this.enddate;
trackingCount=0;
originalyears=0;
maxID :any;
newID =0;
dayOfMonth:any = this.navParams.get('dayOfMonth');
status = false;
banknamehiddenstate:boolean = this.paymenttype==='' || this.paymenttype==='Pay by Cash'?true:false;
notificationhiddenstate:boolean=!(this.notificationstates);
daysNoBefore:any=['1 day before','2 days before','3 days before','4 days before','5 days before','6 days before','7 days before'];
	constructor(
				public navCtrl: NavController, 
				public navParams: NavParams,
				public viewCtrl: ViewController,
				public smoneydb: SqlitedbProvider,
				public alertCtrl: AlertController,
				public localNotifications: LocalNotifications,
				public platform: Platform) {
					this.registerbackbtn();
	}
	ionViewDidLoad() {
	console.log('ionViewDidLoad LoanModalPage');
					this.registerbackbtn();
	}
	registerbackbtn(){
		this.platform.ready().then(() => {
			  //Registration of push in Android and Windows Phone
			  this.platform.registerBackButtonAction(() => {
				  this.viewCtrl.dismiss([false,1]);
			  });
		});
	}
	ionViewWillEnter() {
		this.registerbackbtn();
	}	
	createLoan(loanDay,notidb){
		this.maxLoanID=this.maxLoanID+1;
		var data = [this.maxLoanID,this.title,this.monthlyamount,Date.parse(this.startdate),Date.parse(this.enddate),loanDay,this.paymenttype,this.bankname,'',notidb];
		this.smoneydb.addData('Loans','(?,?,?,?,?,?,?,?,?,?)', data);
		this.maxTansactionID = this.smoneydb.createTrackingDetails(this.maxTansactionID,this.maxLoanID,'Loan',new Date(this.startdate),new Date(this.enddate),loanDay,this.monthlyamount,this.bankname,'create');
		this.status=true;
		var nextPaymentDate = moment(this.smoneydb.getNextPaymentDate(this.startdate,this.enddate,loanDay));
		var nextNotificationTime = new Date(nextPaymentDate.subtract('day', parseInt(this.notificationDaysBefore)).format('YYYY-MM-DD ')+this.notificationTime);
		nextNotificationTime=nextNotificationTime>new Date()?nextNotificationTime:moment(nextNotificationTime).add('month',1).toDate();
		this.smoneydb.createRepeatNotification('Loan',this.maxLoanID,this.monthlyamount,this.title,nextNotificationTime,new Date(nextPaymentDate.format('YYYY-MM-DD')));
		this.viewCtrl.dismiss([this.status,this.trackingCount]);
	}
	updateLoan(loanDay,notidb){
		var nsd,ned,osd,oed;
		nsd=Date.parse(this.startdate);ned=Date.parse(this.enddate);
		osd=Date.parse(this.originalStartDate);oed=Date.parse(this.originalEndDate);
		if (nsd>osd){
			this.smoneydb.cleanTrackingDetails(this.typeid,'Loan',new Date(nsd),'<');
		}
		if (ned<oed){
			this.smoneydb.cleanTrackingDetails(this.typeid,'Loan',new Date(ned),'>');
		}
		if (nsd<osd){
			this.status=true;
			this.maxTansactionID = this.smoneydb.createTrackingDetails(this.maxTansactionID,this.typeid,'Loan',new Date(this.startdate),new Date(osd),loanDay,this.monthlyamount,this.bankname,'updatestart');
		}
		if (ned>oed){
			this.status=true;
			this.maxTansactionID = this.smoneydb.createTrackingDetails(this.maxTansactionID,this.typeid,'Loan',new Date(oed),new Date(this.enddate),loanDay,this.monthlyamount,this.bankname,'updateend');
		}
		if (this.originalamount!=this.monthlyamount){
			this.smoneydb.updateTransactionData('amount=?',[this.monthlyamount,this.typeid,'Loan']);
		}
		var data = [this.title,this.monthlyamount,nsd,ned,loanDay,this.paymenttype,this.bankname,notidb,this.typeid];
		this.smoneydb.updateData('Loans','title=?,monthlyamount=?,startdate=?,enddate=?,monthlypaymentday=?,paymenttype=?,bankName=?,notiDaysBefore=?', data);
		var nextPaymentDate = moment(this.smoneydb.getNextPaymentDate(this.startdate,this.enddate,loanDay));
		var nextNotificationTime = new Date(nextPaymentDate.subtract('day', parseInt(this.notificationDaysBefore)).format('YYYY-MM-DD ')+this.notificationTime);
		nextNotificationTime=nextNotificationTime>new Date()?nextNotificationTime:moment(nextNotificationTime).add('month',1).toDate();
		this.smoneydb.createRepeatNotification('Loan',this.maxLoanID,this.monthlyamount,this.title,nextNotificationTime,new Date(nextPaymentDate.format('YYYY-MM-DD')));
		this.viewCtrl.dismiss([true,this.trackingCount]);
		
	}
	saveLoan(){
	this.monthlyamount = this.monthlyamount.toString()==='' ? '0' : this.monthlyamount; //set loan amount not empty
	this.paymenttype = this.paymenttype.toString()==='' ? 'Pay by Cash' : this.paymenttype; //set default payment method    
	var loanDay = this.smoneydb.getpaymentDay(this.startdate,this.monthlypaymentday);
	this.trackingCount=new Date(this.enddate).getFullYear()-new Date(this.startdate).getFullYear();
	this.originalyears=new Date(this.originalEndDate).getFullYear()-new Date(this.originalStartDate).getFullYear();
	this.originalyears=this.originalyears==0?12:this.originalyears*12;
	this.trackingCount=this.trackingCount==0?12:this.trackingCount*12;
	this.trackingCount=this.trackingCount<this.originalyears?this.originalyears+1:this.trackingCount+1;
	var notidb = this.notificationstates?this.notificationDaysBefore+','+this.notificationTime:'';
	if (this.title!='') {
	  switch (this.action){
		case 'Create' : {this.createLoan(loanDay,notidb);break; }
		case 'Update' : {this.updateLoan(loanDay,notidb);break; }
		default : {break;}
	  }	
	}
	else {
	  let prompt = this.alertCtrl.create({
		  title: 'Loan Title is empty!',
		  message: 'Please provide loan title or touch at "Cancel" button to dismiss',
		  buttons: [{text: 'Continue edit this Loan'},{ text: 'Cancel',handler: data => {this.viewCtrl.dismiss();}}]});
	  prompt.present();
	}
	}
	deleteLoan(){
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
			  this.smoneydb.deleteData('Loans',this.typeid,'');
			  this.smoneydb.deleteData('Tracking',this.typeid,'Loan');
			  this.smoneydb.deleteData('sMoneyOffline',this.typeid,'Loan');
			  		this.trackingCount=new Date(this.enddate).getFullYear()-new Date(this.startdate).getFullYear();
					this.trackingCount=this.trackingCount==0?12:this.trackingCount*12;
				this.localNotifications.hasPermission().then((granted)=> {
					this.localNotifications.cancel((1000+parseInt(this.typeid)));
				}).catch((error) => {alert(error);}); 
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
	notificationState(){
		this.notificationhiddenstate=!this.notificationstates;	
	}
	closeModal() {
		this.viewCtrl.dismiss();
	}
}

