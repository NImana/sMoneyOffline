import { Component } from '@angular/core';
import { IonicPage, AlertController, NavController, NavParams,LoadingController,Platform,ViewController} from 'ionic-angular';
import { SqlitedbProvider } from '../../providers/sqlitedb/sqlitedb';

/**
 * Generated class for the TrackingModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tracking-modal',
  templateUrl: 'tracking-modal.html',
})
export class TrackingModalPage {
typeid: string = this.navParams.get('typeid');
title: string = this.navParams.get('title');
type: string = this.navParams.get('type');
monthlypaymentday : string = this.navParams.get('monthlypaymentday');
amount : string = this.navParams.get('amount');
bankName : string = this.navParams.get('bankName');
maxTansactionID:string = this.navParams.get('maxTansactionID');
tracks:any=[];
maxyear:any;
years:any=[];
  constructor(	public navCtrl: NavController, 
				public alertCtrl: AlertController,
				public smoneydb: SqlitedbProvider,
				public navParams: NavParams,
				public loadingCtrl: LoadingController,
				public viewCtrl: ViewController,
				public platform: Platform) {
					this.registerbackbtn();
  }
	registerbackbtn(){
		this.platform.ready().then(() => {
			  //Registration of push in Android and Windows Phone
			  this.platform.registerBackButtonAction(() => {
				  this.viewCtrl.dismiss();
			  });
		});
	}
	ionViewDidLoad() {
		this.getData();	
	}
	ionViewWillEnter() {
		this.getData();
	}
	ionViewDidEnter(){
		 this.getData();
	}
	getData() {
		this.registerbackbtn();
		var trackyeardata = [this.typeid,this.type];
		var curYear= new Date().getFullYear();
		this.smoneydb.gettrackyear(trackyeardata).then((result) => {
			this.years = result;
			this.maxyear=this.years[this.years.length-1];
			this.maxyear=this.maxyear>curYear?curYear:this.maxyear;
		}).catch((error) => {alert(error);});
		var trackdata = [this.typeid,this.type,this.maxyear];
		this.smoneydb.getTracking(trackdata).then((result) => {this.tracks = result;}).catch((error) => {alert(error);});
	}
	onYearChange(){
		var trackdata = [this.typeid,this.type,this.maxyear];
		this.smoneydb.getTracking(trackdata).then((result) => {this.tracks = result;}).catch((error) => {alert(error);});
	}
	editData(track){
		var dataupdate, curDay,curMonth,curYear,monthName, trackday,trackmonth,paymentDate,curDate;
		monthName=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
		//manage current date variable
		curDay=new Date().getDate();curMonth=new Date().getMonth()+1;curYear=new Date().getFullYear();curDay=parseInt(curDay)<9? '0'+curDay:curDay; curMonth=parseInt(curMonth)<9? '0'+curMonth:curMonth;
		//manage track date variable
		trackday =parseInt(this.monthlypaymentday)<9? '0'+parseInt(this.monthlypaymentday):parseInt(this.monthlypaymentday);trackmonth =track.month<9? '0'+track.month:track.month;
		//parse the date
		paymentDate = Date.parse(track.year+'-'+trackmonth+'-'+trackday);curDate = Date.parse(curYear+'-'+curMonth+'-'+curDay);
		
		var title,message,ontime,latepay,late;
		title= this.type==='Loan'?'Have you pay?':'Have you receive this income?';
		message= this.type==='Loan'? 'Have you pay ' + this.title + ' loan for ' + monthName[track.month] + ' ' + track.year + ' ?' :'Have you receive ' + this.title + '  for ' + monthName[track.month] + ' ' + track.year + ' ?' ;
		ontime= this.type==='Loan'? 'Paid Ontime': 'Received Ontime';
		latepay= this.type==='Loan'? 'Late Payment' :  'Received Late';
		late= this.type==='Loan'? 'Not Paid' :  'Not Receive';
		let prompt = this.alertCtrl.create({
		  title: title,
		  message: message ,
		  buttons: [
			{
				text: ontime,
				handler: data => {
					var sMoneyTransactionData=[this.typeid,this.type,track.year,track.month];this.smoneydb.deleteTransaction(sMoneyTransactionData);
					dataupdate = ['✔',this.typeid,this.type,track.year,track.month];var transactionData=[this.typeid,paymentDate,this.type,this.amount,this.bankName];
					this.smoneydb.updateTrackingData('Tracking',' status=? ',dataupdate);
					this.smoneydb.addData('sMoneyOffline','(NULL,?,?,?,?,?)', transactionData);
					this.smoneydb.getNewID('transactionID','sMoneyOffline')
					.then((result) => {
							var maxID,newID ;
							maxID = result; 
							newID = maxID.length > 0 ? maxID[0]: 0; 	
							var data = [newID,this.typeid,this.type,curYear,curMonth];
							this.smoneydb.updateTrackingData('Tracking','transactionID=?',data);
					}).catch((error) => {alert(error);});
					this.getData();
				}
			},
			{
				text: latepay,
				handler: data => {	
					var transactionDate;		
						let prompt = this.alertCtrl.create({
						title: 'When did you pay?',
						message: "If leave blank, today date will be picked by default.",
						inputs: [
								{
								  name: 'TransactionDate',
								  type: 'date'
								},
							  ],
						buttons:[
									{
									text: 'Cancel',
									handler: data => {
										console.log('Cancel clicked');
										}
									},
									{
									text: 'Save',
									handler: data => {
										var sMoneyTransactionData=[this.typeid,this.type,track.year,track.month];this.smoneydb.deleteTransaction(sMoneyTransactionData);
										transactionDate=data.TransactionDate;
										transactionDate=transactionDate.length<=1?curDate:Date.parse(data.TransactionDate);	
										dataupdate = paymentDate>transactionDate ? ['-',this.typeid,this.type,track.year,track.month] : ['Late ✔',this.typeid,this.type,track.year,track.month] ; var transactionData=[this.typeid,transactionDate,this.type,this.amount,this.bankName];
										this.smoneydb.updateTrackingData('Tracking',' status=? ',dataupdate);
										this.smoneydb.addData('sMoneyOffline','(NULL,?,?,?,?,?)', transactionData);
										this.smoneydb.getNewID('transactionID','sMoneyOffline')
										.then((result) => {
												var maxID,newID ;
												maxID = result; 
												newID = maxID.length > 0 ? maxID[0]: 0; 	
												var data = [newID,this.typeid,this.type,curYear,curMonth];
												this.smoneydb.updateTrackingData('Tracking','transactionID=?',data);
										}).catch((error) => {alert(error);});
										this.getData();
										}
									}
								]
						});
						prompt.present();	
						this.getData();

				}
			},
			{
				text: late,
				handler: data => {					
					dataupdate = paymentDate>curDate ? ['-',this.typeid,this.type,track.year,track.month] : ['Late',this.typeid,this.type,track.year,track.month] ; var sMoneyTransactionData=[this.typeid,this.type,track.year,track.month];
					this.smoneydb.deleteTransaction(sMoneyTransactionData);
					this.smoneydb.updateTrackingData('Tracking',' status=?,transactionID=NULL',dataupdate);		
					this.getData();
				}
			}
		  ]
		});

		prompt.present();
		this.getData();
	}
}
