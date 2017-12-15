import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform,ViewController,FabContainer,AlertController,Content,LoadingController} from 'ionic-angular';
import { SqlitedbProvider } from '../../providers/sqlitedb/sqlitedb';
import * as moment from 'moment';

/**
 * Generated class for the TransactionModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-transaction-modal',
  templateUrl: 'transaction-modal.html',
})
export class TransactionModalPage {
	@ViewChild(Content) content: Content;
addMenuHiddenState:boolean=true;
addTransactionHiddenState:boolean = this.navParams.get('addTransactionHiddenState');
maxTansactionID:number = Number(this.navParams.get('maxTansactionID'));
trID:number;
typeID:number;
type:string=this.navParams.get('type');
title:string;
amount:number=0;
transactionDate:string=moment(new Date()).format('YYYY-MM-DD');
transactionTime:string=moment(new Date()).format('HH:mm');
paymenttype:string='Pay by Cash';
banknamehiddenstate:boolean=true;
changedateHiddenState:boolean=true;
bankname:string='Cash';
action:string='create';
transactions:any=[];
menufab:FabContainer;
startDate:number=Date.parse(new Date().toISOString().slice(0,8)+'01');
endDate:number=isNaN(Date.parse(new Date().toISOString().slice(0,5)+((new Date().getMonth()+2)<=9?'0'+(new Date().getMonth()+2):(new Date().getMonth()+2))+'-01'))?Date.parse((new Date().getFullYear()+1)+'-01-01'):Date.parse(new Date().toISOString().slice(0,5)+((new Date().getMonth()+2)<=9?'0'+(new Date().getMonth()+2):(new Date().getMonth()+2))+'-01');
displaystartDate=new Date(this.startDate).toISOString().slice(0,10);
displayendDate=new Date(this.endDate).toISOString().slice(0,10);

  constructor(	public navCtrl: NavController, 
				public alertCtrl: AlertController,
				public smoneydb: SqlitedbProvider,
				public viewCtrl: ViewController,
				public loadingCtrl: LoadingController,
				public navParams: NavParams,
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
    console.log('ionViewDidLoad TransactionModalPage');
		this.getData();
	}
	ionViewWillEnter() {
		this.registerbackbtn();
		this.getData();
	}

	getData() {
		this.smoneydb.getTransactionsDetails([this.startDate,this.endDate]).then((result) => {this.transactions = result;}).catch((error) => {alert(error);});
		//this.smoneydb.getBonusAndExpense().then((result) => {this.transactions = result;}).catch((error) => {alert(error);});

	}
	onPaymentTypeChange(){
		this.banknamehiddenstate=this.paymenttype==='Pay by Cash'?true:false;
		this.bankname=this.paymenttype==='Pay by Cash'?'Cash':'';
	}
	editTransaction(transaction,slidingItem){
		slidingItem.close();
		this.action='update';
		this.addTransactionHiddenState=false;
		this.trID=transaction.transactionID;
		this.typeID=transaction.typeid;
		this.type=transaction.type;
		this.title=transaction.title;
		this.transactionDate=moment(transaction.transactiondate).format('YYYY-MM-DD');
		this.transactionTime=moment(transaction.transactiondate).format('HH:mm');
		this.paymenttype=transaction.bankName==='Cash'?'Pay by Cash':'Online banking payment';
		this.banknamehiddenstate=transaction.bankName==='Cash'?true:false;
		this.bankname=transaction.bankName;
		this.amount=transaction.amount;
		this.content.scrollToTop();
	}
	saveTransaction (){
		if (this.title===''){
			alert("Title can not be empty!");
		}else{
			var transactionData,data,tablename;
			this.addTransactionHiddenState=true;
			var tdatetime=Date.parse(this.transactionDate+' '+this.transactionTime);
			if(this.action==='create'){
				if (this.type==='Bonus' || this.type==='Expense'){
					this.maxTansactionID=this.maxTansactionID+1;
					transactionData=[this.maxTansactionID,this.maxTansactionID,tdatetime,this.type,this.amount,this.bankname];
					this.smoneydb.addData('sMoneyOffline','(?,?,?,?,?,?)', transactionData);
					tablename=this.type==='Bonus'?'Bonuses':'Expenses';
					data= [this.maxTansactionID,this.title,this.amount,this.paymenttype,this.bankname];
					this.smoneydb.addData(tablename,'(?,?,?,?,?)',data);
				}
			}else{
				if (this.type==='Bonus' || this.type==='Expense'){
					tablename=this.type==='Bonus'?'Bonuses':'Expenses';
					this.smoneydb.updateData('sMoneyOffline','transactiondate=?,amount=?,bankName=?',
					[tdatetime,this.amount,this.bankname,this.trID]);
					this.smoneydb.updateData(tablename,'title=?,amount=?,paymenttype=?,bankName=?',
					[this.title,this.amount,this.paymenttype,this.bankname,this.trID]);
			
					
				}else{
					alert('You only allowed to delete or view this transaction. Please go to '+this.type+' trackings to update this transaction details.');
				}
			}
			this.getData();
		}
		this.action='create';
	}
	deleteTransaction (){
		this.addTransactionHiddenState=true;
		if(this.action==='update'){
			if (this.type==='Bonus' || this.type==='Expense'){
				var tablename=this.type==='Bonus'?'Bonuses':'Expenses';
				this.smoneydb.deleteData('sMoneyOffline',this.trID,this.type);
				this.smoneydb.deleteData(tablename,this.trID,'');
				
			}else{
				this.smoneydb.deleteData('sMoneyOffline',this.trID,this.type);
				this.smoneydb.getTransactionsTracking(this.trID).then((result)=>{
					var dataupdate=['Late',this.typeID,this.type,result[0].year,result[0].month];					
					this.smoneydb.updateTrackingData('Tracking',' status=?,transactionID=NULL',dataupdate);	
				});
			}
		}
		this.getData();
		this.action='create';
	}
	addBonusExpense(action){
		this.changedateHiddenState=true;
		if (action==='Bonus'||action==='Expense'){
			this.addTransactionHiddenState=false;
			this.type=action;
			this.title='';this.amount=0;
			this.transactionDate=moment(new Date()).format('YYYY-MM-DD');
			this.transactionTime=moment(new Date()).format('HH:mm');
			this.paymenttype='Pay by Cash';
			this.banknamehiddenstate=true;
			this.bankname='Cash';
			this.action='create';	
			this.registerbackbtn();
			this.menufab.close();
		}else{
			this.addMenuHiddenState=!this.addMenuHiddenState;
		}
	}
	assignmenuFab(fab: FabContainer){
		this.menufab=fab;
		return false;
	}
	changeDateRange(action){
		this.menufab.close();
		if (action===''){
			this.changedateHiddenState=!this.changedateHiddenState;
			this.addMenuHiddenState=true;
			this.addTransactionHiddenState=true;			
		}else{
			if (action==='start'){
				let promptStart = this.alertCtrl.create({
				title: 'Choose Start Date',
				message: "If leave blank, 01-"+moment().format("MMM-YYYY")+" will be picked by default.",
				inputs: [{name: 'from',type: 'date'}],
				buttons:[{text: 'Cancel',handler: data => {}},
							{
								text: 'Set Start Date',
								handler: data => {
										//alert(typeof data.from + ' : ' + data.from);
										data.from=data.from.length<1?new Date(moment().format("YYYY-MM")+"-01"):data.from;
										this.startDate=Date.parse(data.from);
										this.displaystartDate=data.from;
										this.getData;
										let loading = this.loadingCtrl.create({content: 'Gathering transactions data...'});
										loading.present();
										setTimeout(() => {loading.dismiss();this.getData();}, 1000);
										this.getData();
									}
							}
						]
				});
				promptStart.present();
			}else{	
				let promptEnd = this.alertCtrl.create({
				title: 'Choose End Date',
				message: "If leave blank, 01-"+moment().add('month',1).format("MMM-YYYY")+" will be picked by default.",
				inputs: [{name: 'from',type: 'date'}],
				buttons:[{text: 'Cancel',handler: data => {}},
							{
								text: 'Set End Date',
								handler: data => {
										//alert(typeof data.from + ' : ' + data.from);
										data.from=data.from.length<1?new Date(moment().add('month',1).format("YYYY-MM")+"-01"):data.from;
										this.endDate=Date.parse(data.from);
										this.displayendDate=data.from;
										this.getData;
										let loading = this.loadingCtrl.create({content: 'Gathering transactions data...'});
										loading.present();
										setTimeout(() => {loading.dismiss();this.getData();}, 1000);
										this.getData();
									}
							}
						]
				});
				promptEnd.present();
			}	
		}
	}
}
