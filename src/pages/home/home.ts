import { Component , ViewChild} from '@angular/core';
import { NavController,AlertController, ModalController,FabContainer,ItemSliding, LoadingController, Platform,Content} from 'ionic-angular';
import { SqlitedbProvider } from '../../providers/sqlitedb/sqlitedb';
import { LocalNotifications } from '@ionic-native/local-notifications';
import * as moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	@ViewChild(Content) content: Content;
loans:any;
incomes:any;
expenses: any;
summary:any;
displayDateExt:any=new Date().getDate() === 1 ? 'st' : new Date().getDate() === 2 ? 'nd' : new Date().getDate() === 3 ? 'rd' : 'th' ;;
displayDate:string = new Date().toISOString();
totalIncome = 0;
totalExpense = 0;
totalPaidLoan = 0;
totalBonus = 0;
balance = 0;
maxTansactionID = 0;
maxLoanID = 0;
maxIncomeID = 0;
tracktoUpdate:any;
tracks:any;
loanupdated='';
menufab:FabContainer;
slidingItem:ItemSliding;
startDate=Date.parse(new Date().toISOString().slice(0,8)+'01');
endDate=isNaN(Date.parse(new Date().toISOString().slice(0,5)+((new Date().getMonth()+2)<=9?'0'+(new Date().getMonth()+2):(new Date().getMonth()+2))+'-01'))?Date.parse((new Date().getFullYear()+1)+'-01-01'):Date.parse(new Date().toISOString().slice(0,5)+((new Date().getMonth()+2)<=9?'0'+(new Date().getMonth()+2):(new Date().getMonth()+2))+'-01');
displaystartDate=new Date(this.startDate).toISOString().slice(0,10);
displayendDate=new Date(this.endDate).toISOString().slice(0,10);
menuHiddenState=true;
changedateHiddenState:boolean=true;
  constructor(	public navCtrl: NavController,
				public alertCtrl: AlertController,
				public modalCtrl: ModalController,
				public smoneydb: SqlitedbProvider,
				public loadingCtrl: LoadingController,
				public localNotifications: LocalNotifications,
				public platform: Platform) 
				{
				this.registerbackbtn();
				this.localnotificationscheck();
		    }
    registerbackbtn(){
		this.platform.ready().then(() => {
			  //Registration of push in Android and Windows Phone
			if(this.menuHiddenState==false){ 
				this.platform.registerBackButtonAction(() => {this.getData();this.menufab.close();});
			}else{
				this.platform.registerBackButtonAction(() => {
					let prompt = this.alertCtrl.create({
					  title: 'Exit this application?',
					  message: 'Do you want to exit this app?' ,
					  buttons: [
						{
						  text: 'Cancel'
						},
						{
						  text: 'Exit',
						  handler: data => {
							this.platform.exitApp();
						  }
						}
					  ]
					});
					prompt.present();
				});				
			}
		});
	}
	localnotificationscheck(){
		this.localNotifications.on("trigger", (notification, state) => {
			  let alert = this.alertCtrl.create({
				title: notification.title,
				subTitle: notification.text,
				buttons: ['Dismiss']
			  });
			  alert.present();
			//this.printObject(notification);
			//this.printObject(state);
        });
		this.localNotifications.on("click", (notification, state) => {
			  let alert = this.alertCtrl.create({
				title: notification.title,
				subTitle: notification.text,
				buttons: ['Dismiss']
			  });
			  alert.present();
        });
	}
	ionViewDidLoad() {
	//	this.getData();
		this.localnotificationscheck();
	}
	ionViewWillEnter() {
	//	 this.getData();
		this.localnotificationscheck();
	}
	ionViewDidEnter(){
		 this.getData();
		 this.registerbackbtn();
		 this.localnotificationscheck();
	}
	cssSettings(){
		    var incomesElement,loansElement,HTMLel;
		    incomesElement=document.getElementsByClassName("incomes");
			//var maxsplit=incomesElement.length<=3?incomesElement.length:3;
			//var incomecss='min-width:calc((100% / '+maxsplit+') - 2px);max-width:calc((100% / '+maxsplit+') - 2px);opacity:1;';
			document.getElementById("incomeheader").style.cssText=incomesElement.length==0?"visibility:hidden;":"visibility:yes;";
			for (let i=0;i<incomesElement.length;i++){
				HTMLel=<HTMLElement>incomesElement[i];
				HTMLel.style.cssText='opacity:1;-webkit-animation: listIn '+((i+1)/2)+'s 1;';
			}
		    loansElement=document.getElementsByClassName("loans");
			document.getElementById("loanheader").style.cssText=loansElement.length==0?"visibility:hidden;":"visibility:yes;";
			for (let i=0;i<loansElement.length;i++){
				HTMLel=<HTMLElement>loansElement[i];
				HTMLel.style.cssText='-webkit-animation: listIn '+((i+1)/2)+'s 1;';
			}
		
	}
	handleMenu(){
		this.menuHiddenState = !this.menuHiddenState;
		this.registerbackbtn();
		var sideMenucss="position:absolute;z-index: 99;min-height: 250px;";
		var sideMenuWrappercss="height:500%;width:100%;align:center;background-color:rgba(0,0,0,0.8);position:absolute;z-index: 98;margin-left: 0;";
		if (this.menuHiddenState==false){
			this.changedateHiddenState=true;
			document.getElementById("sideButtonMenuWrapper").style.cssText = sideMenuWrappercss;
			document.getElementById("sideButtonMenuWrapper").style.cssText = sideMenuWrappercss + "-webkit-animation: sideMenuButtonIn 0.6s 1;display:block;";
			document.getElementById("sideButtonMenu").style.cssText = sideMenucss;
			document.getElementById("sideButtonMenu").style.cssText = sideMenucss + "-webkit-animation: sideMenuButtonIn 1.2s 1;margin-left: 0;display:block;";
			document.getElementById("fabbutton").style.cssText="opacity:0;-webkit-animation: listOut 0.5s 1;";
		}
		else{
			document.getElementById("sideButtonMenuWrapper").style.cssText = sideMenuWrappercss;
			document.getElementById("sideButtonMenuWrapper").style.cssText = sideMenuWrappercss + "-webkit-animation: sideMenuButtonOut 1.5s 1;margin-left: -101%";
			document.getElementById("sideButtonMenu").style.cssText = sideMenucss;
			document.getElementById("sideButtonMenu").style.cssText = sideMenucss + "-webkit-animation: sideMenuButtonOut 1s 1;margin-left: -101%;";
			document.getElementById("fabbutton").style.cssText="opacity:1;-webkit-animation: listIn 0.5s 1;";
			//setTimeout(() => {this.content.scrollToTop();}, 1000);	
		}	
	}
	getData() {
		this.menuHiddenState=false;
		this.handleMenu();
		this.smoneydb.getNewID('transactionID','sMoneyOffline').then((result) => {this.maxTansactionID = isNaN(parseInt(result[0]))?0:parseInt(result[0]);}).catch((error) => {alert(error);});
		this.smoneydb.getTrackingToUpdate().then((result) => {
			var cd,td,cpd;this.tracktoUpdate=[];cd=Date.parse(moment().format('YYYY-MM-DD'));
			var momxDay=[0,31,28,31,30,31,30,31,31,30,31,30,31];
			this.tracktoUpdate = result;//this.printObject(result);
			for(var i=0; i<this.tracktoUpdate.length; i++) {				
				momxDay[2]=(parseInt(this.tracktoUpdate[i].year) % 4)==0?29:28;
				cpd=parseInt(this.tracktoUpdate[i].monthlypaymentday)<=momxDay[parseInt(this.tracktoUpdate[i].month)]?this.tracktoUpdate[i].monthlypaymentday:momxDay[this.tracktoUpdate[i].month];
				td=Date.parse(this.tracktoUpdate[i].year+'-'+this.tracktoUpdate[i].month+'-'+cpd);//this.printObject(this.tracktoUpdate[i]);
				if (td<=cd){
					this.maxTansactionID=this.maxTansactionID+1;
					this.smoneydb.updateTrackingData('Tracking','status="✔",transactionID='+this.maxTansactionID,[this.tracktoUpdate[i].typeid,this.tracktoUpdate[i].type,this.tracktoUpdate[i].year,this.tracktoUpdate[i].month]);
					this.smoneydb.addData('sMoneyOffline','(?,?,?,?,?,?)', [this.maxTansactionID,this.tracktoUpdate[i].typeid,td,this.tracktoUpdate[i].type,this.tracktoUpdate[i].amount,this.tracktoUpdate[i].bankName]);							
					this.smoneydb.refreshProgress();
				}
			}		
		}).catch((error) => {alert(error);}); 
		this.smoneydb.refreshProgress();	
		this.smoneydb.getNewID('typeID','Loans').then((result) => {this.maxLoanID = isNaN(parseInt(result[0]))?0:parseInt(result[0]);}).catch((error) => {alert(error);});
		this.smoneydb.getNewID('typeID','Incomes').then((result) => {this.maxIncomeID = isNaN(parseInt(result[0]))?0:parseInt(result[0]);}).catch((error) => {alert(error);});	
		this.smoneydb.getScheduled('Loan').then((result) => {this.loans = result;}).catch((error) => {alert(error);});
		this.smoneydb.getScheduled('Income').then((result) => {this.incomes = result;}).catch((error) => {alert(error);});
		this.smoneydb.getSummary([this.startDate,this.endDate]).then((result) => {
				this.summary = result;this.totalIncome=0;this.totalPaidLoan=0;this.totalExpense=0;this.totalBonus=0;
				for(var i=0; i<this.summary.length; i++) {
					this.totalIncome = this.summary[i].type === 'Income' ? this.summary[i].total : this.totalIncome;
					this.totalPaidLoan = this.summary[i].type === 'Loan' ? this.summary[i].total : this.totalPaidLoan;
					this.totalExpense = this.summary[i].type === 'Expense' ? this.summary[i].total : this.totalExpense;
					this.totalBonus = this.summary[i].type === 'Bonus' ? this.summary[i].total : this.totalBonus;
				}
				this.balance = (this.totalIncome +  this.totalBonus )- (this.totalExpense + this.totalPaidLoan);		
		}).catch((error) => {alert(error);}); 
		
		 //setTimeout(() => {this.cssSettings();}, 1000);
	}

	getDayOfMonth() {
	var lastChar,dToChar,dayOfMonth;
	dayOfMonth =[];
	for (var d=1; d <= 31 ; d++){
		dToChar=d.toString();
		lastChar = dToChar[dToChar.length -1] === '1' ? 'st' : (dToChar[dToChar.length -1] === '2' ? 'nd' : (dToChar[dToChar.length -1] === '3' ? 'rd' : 'th'));
		lastChar = d>10 && d<20 ? 'th' : lastChar;
		dayOfMonth.push(dToChar+lastChar);	
		}
	return dayOfMonth;
	}	
	viewTransaction(slidingItem){
		var TransactionModalPage = this.modalCtrl.create('TransactionModalPage',{addTransactionHiddenState:true,maxTansactionID: this.maxTansactionID});
		TransactionModalPage.onDidDismiss(() => {this.getData();});
		TransactionModalPage.present();
		slidingItem.close();
		this.registerbackbtn();	
	}
	addTransaction(transactiontype,slidingItem){
		var TransactionModalPage = this.modalCtrl.create('TransactionModalPage',{addTransactionHiddenState:false,type:transactiontype,maxTansactionID: this.maxTansactionID});
		TransactionModalPage.onDidDismiss(() => {this.getData();});
		TransactionModalPage.present();
		slidingItem.close();
		this.registerbackbtn();	
	}
	createLoan(fab: FabContainer){
		fab.close();
		var todayDate, day, month, year;
		day = new Date().getDate().toString();
		day = day.length==1 ? '0' + day : day;
		month = new Date().getMonth() + 1;
		month = month.toString();
		month = month.length==1 ? '0' + month : month;
		year = new Date().getFullYear().toString();
		todayDate = year + '-' + month + '-' + day;
		let loanAction = {
					action: 'Create',
					title: '',
					monthlyamount: '',
					startdate: todayDate,
					enddate: todayDate,
					monthlypaymentday: '1st',
					paymenttype: '',
					bankName: '',
					dayOfMonth: this.getDayOfMonth(),
					maxTansactionID: this.maxTansactionID,
					maxLoanID:this.maxLoanID,
					notificationTime:'08:00',
					notificationDaysBefore:'1 day before',
					notificationstates:false
				   }
		var loanModal = this.modalCtrl.create('LoanModalPage',loanAction);
		loanModal.onDidDismiss(data => {
			if (data[0]){
				let loading = this.loadingCtrl.create({content: 'Creating loan details for ' + (data[1]/12).toFixed(0) +' years...'});
				loading.present();
				var timeout = (data[1]*200)<2000?2000:(data[1]*200);
				setTimeout(() => {loading.dismiss();this.getData();}, timeout);
			}else{this.getData();}
			this.getData();		
			this.registerbackbtn();
		});
		loanModal.present();
	}
	createIncome(fab: FabContainer){
		fab.close();
		var todayDate, day, month, year;
		day = new Date().getDate().toString();
		day = day.length==1 ? '0' + day : day;
		month = new Date().getMonth() + 1;
		month = month.toString();
		month = month.length==1 ? '0' + month : month;
		year = new Date().getFullYear().toString();
		todayDate = year + '-' + month + '-' + day;
		let incomeAction = {
					action: 'Create',
					title: '',
					monthlyamount: '',
					startdate: todayDate,
					enddate: todayDate,
					monthlypaymentday: '1st',
					paymenttype: '',
					bankName: '',
					dayOfMonth: this.getDayOfMonth(),
					maxTansactionID: this.maxTansactionID,
					maxIncomeID:this.maxIncomeID
				   }
		var incomeModal = this.modalCtrl.create('IncomeModalPage',incomeAction);
		incomeModal.onDidDismiss(data => {
			if (data[0]){
				let loading = this.loadingCtrl.create({content: 'Creating income details for ' + (data[1]/12).toFixed(0) +' years...'});
				loading.present();
				var timeout = (data[1]*200)<2000?2000:(data[1]*200);
				setTimeout(() => {loading.dismiss();this.getData();}, timeout);
			}else{this.getData();}	
			this.getData();
			this.registerbackbtn();
		});
		incomeModal.present();
	}
	updateLoan(loan,slidingItem){
		var notidb = loan.notiDaysBefore===''?['1 day before','08:00']:loan.notiDaysBefore.split(',');		
		let loanAction = {
					action: 'Update',
					typeid: loan.typeid,
					title: loan.title,
					monthlyamount: loan.monthlyamount,
					startdate: loan.startdate,
					enddate: loan.enddate,
					paymenttype: loan.paymenttype,
					monthlypaymentday: loan.monthlypaymentday,
					bankName: loan.bankName,
					dayOfMonth :this.getDayOfMonth(),
					maxTansactionID: this.maxTansactionID,
					maxLoanID:this.maxLoanID,
					notificationTime:notidb[1],
					notificationDaysBefore:notidb[0],
					notificationstates:!(loan.notiDaysBefore==='')
				   }
		var loanModal = this.modalCtrl.create('LoanModalPage',loanAction);
		loanModal.onDidDismiss(data => {
			if (data[0]){
				let loading = this.loadingCtrl.create({content: 'Updating loan details for ' + (data[1]/12).toFixed(0) +' years...'});
				loading.present();
				var timeout = (data[1]*200)<2000?2000:(data[1]*200);
				setTimeout(() => {loading.dismiss();this.getData();}, timeout);
			}else{this.getData();}	
			this.getData();
			this.registerbackbtn();
		});
		loanModal.present();
		slidingItem.close();
	}
	updateIncome(income,slidingItem){
		let incomeAction = {
					action: 'Update',
					typeid: income.typeid,
					title: income.title,
					monthlyamount: income.monthlyamount,
					startdate: income.startdate,
					enddate: income.enddate,
					paymenttype: income.paymenttype,
					monthlypaymentday: income.monthlypaymentday,
					bankName: income.bankName,
					dayOfMonth :this.getDayOfMonth(),
					maxTansactionID: this.maxTansactionID,
					maxIncomeID:this.maxIncomeID
				   }
		var incomeModal = this.modalCtrl.create('IncomeModalPage',incomeAction);
		incomeModal.onDidDismiss(data => {
			if (data[0]){
				let loading = this.loadingCtrl.create({content: 'Updating income details for ' + (data[1]/12).toFixed(0) +' years...'});
				loading.present();
				var timeout = (data[1]*200)<2000?2000:(data[1]*200);
				setTimeout(() => {loading.dismiss();this.getData();}, timeout);
			}else{this.getData();}	
			this.getData();
			this.registerbackbtn();
		});
		incomeModal.present();
		slidingItem.close();
	}
	loantracking(loan,slidingItem){
		let loanAction = {
					typeid: loan.typeid,
					title: loan.title,
					type: 'Loan',
					monthlypaymentday : loan.monthlypaymentday ,
					amount:loan.monthlyamount,
					bankName: loan.bankName,
					maxTansactionID: this.maxTansactionID
				   }
		var trackingModal = this.modalCtrl.create('TrackingModalPage',loanAction);
		trackingModal.onDidDismiss(() => {this.getData();});
		trackingModal.present();
		slidingItem.close();
		this.registerbackbtn();
	}
	incometracking(income,slidingItem){
		let incomeAction = {
					typeid: income.typeid,
					title: income.title,
					type: 'Income',
					monthlypaymentday : income.monthlypaymentday ,
					amount:income.monthlyamount,
					bankName: income.bankName,
					maxTansactionID: this.maxTansactionID
				   }
		var trackingModal = this.modalCtrl.create('TrackingModalPage',incomeAction);
		trackingModal.onDidDismiss(() => {this.getData();});
		trackingModal.present();
		slidingItem.close();
		this.registerbackbtn();
	}
	deleteLoan(loan,slidingItem) {
	  this.smoneydb.deleteData('Loans',loan.typeid,'');
	  this.smoneydb.deleteData('Tracking',loan.typeid,'Loan');
	  this.smoneydb.deleteData('sMoneyOffline',loan.typeid,'Loan');
	  this.getData();
				this.localNotifications.hasPermission().then((granted)=> {
					this.localNotifications.cancel((1000+parseInt(loan.typeid)));
				}).catch((error) => {alert(error);}); 
		this.registerbackbtn();
		this.showMenu(slidingItem);
	}
	deleteIncome(income,slidingItem) {
	  this.smoneydb.deleteData('Incomes',income.typeid,'');
	  this.smoneydb.deleteData('Tracking',income.typeid,'Income');
	  this.smoneydb.deleteData('sMoneyOffline',income.typeid,'Income');
	  this.getData();
	  this.registerbackbtn();
		this.showMenu(slidingItem);
	}
	getLoanStatus(loan){
		var imgSchedule,imgCash,imgOk,paymentType,strPaid,strUnpaid,strLate,strComplete,currentMonth,Status,monthNames,p;
		monthNames=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		imgSchedule = '<img src="assets/icon/schedule64.png" class="loanStatus">';
		imgCash = '<img src="assets/icon/cash64.png" class="loanStatus">';
		imgOk = '<img src="assets/icon/ok64.png" class="loanStatus">' ;
		paymentType= loan.paymenttype === 'Scheduled online banking payment' ? 1 : 0;
		currentMonth = new Date().getMonth()+1; 
		strPaid = imgOk + '<p> Paid for this Month </p>' ;
		strUnpaid = '<p> Waiting for scheduled payment on ' + loan.monthlypaymentday  + ' of ' + monthNames[currentMonth]  +'</p>';
		strLate = '<p> Late payment on ' + loan.monthlypaymentday  + ' of ' + monthNames[currentMonth]  +'</p>';
		strComplete = imgOk + '<p> Congratulation! <br /> Loan completed on ' + loan.enddate  + '!</p>' ; 
		p=loan.progress.split(',');
		strComplete = parseInt(p[0])==0?strComplete:'<p> Loan overdue! <br /> Loan supposed to end on ' + loan.enddate  + '!</p>';
		Status = paymentType == 1 ?  imgSchedule : imgCash ;
		Status=loan.status==='✔'?Status+strPaid:loan.status==='Late'?Status+strLate:(Date.parse(loan.enddate)<Date.parse(new Date().toISOString().slice(0,10))?Status+strComplete:Status+strUnpaid);
		if (Status.indexOf("strComplete")>=0){
				this.localNotifications.hasPermission().then((granted)=> {
					this.localNotifications.cancel((1000+parseInt(loan.typeid)));
				}).catch((error) => {alert(error);}); 			
		}
		return Status;
	}
	getIncomeStatus(income){
		var imgSchedule,imgCash,imgOk,paymentType,strPaid,strUnpaid,strLate,strComplete,currentMonth,Status,monthNames,p;
		monthNames=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		imgSchedule = '<div><img src="assets/icon/schedule64.png" class="incomeStatus"></div>';
		imgCash = '<div><img src="assets/icon/cash64.png" class="incomeStatus"></div>';
		imgOk = '<div><img src="assets/icon/ok64.png" class="incomeStatus"></div>' ;
		paymentType= income.paymenttype === 'Scheduled online banking payment' ? 1 : 0;
		currentMonth = new Date().getMonth()+1; 
		strPaid = imgOk;
		strUnpaid = '';
		strLate = '';
		strComplete = imgOk ; 
		p=income.progress.split(',');
		strComplete = parseInt(p[0])==0?strComplete:'';
		Status = paymentType == 1 ?  imgSchedule : imgCash ;
		Status=income.status==='✔'?Status+strPaid:income.status==='Late'?Status+strLate:(Date.parse(income.enddate)<Date.parse(new Date().toISOString().slice(0,10))?Status+strComplete:Status+strUnpaid);
		return Status;
	}
	getIncomeStatusStr(income){
		var imgSchedule,imgCash,imgOk,paymentType,strPaid,strUnpaid,strLate,strComplete,currentMonth,Status,monthNames,p;
		monthNames=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		imgSchedule = '<div><img src="assets/icon/schedule64.png" class="incomeStatus"></div>';
		imgCash = '<div><img src="assets/icon/cash64.png" class="incomeStatus"></div>';
		imgOk = '<div><img src="assets/icon/ok64.png" class="incomeStatus"></div>' ;
		paymentType= income.paymenttype === 'Scheduled online banking payment' ? 1 : 0;
		currentMonth = new Date().getMonth()+1; 
		strPaid = '<div><p> Income received this month. </p></div>' ;
		strUnpaid = '<div><p> Waiting to be received on ' + income.monthlypaymentday  + ' of ' + monthNames[currentMonth]  +'</p></div>';
		strLate = '<div><p> Late payment on ' + income.monthlypaymentday  + ' of ' + monthNames[currentMonth]  +'</p></div>';
		strComplete = '<div><p> This income has end on' + income.enddate  + '.</p></div>' ; 
		p=income.progress.split(',');
		strComplete = parseInt(p[0])==0?strComplete:'<div><p> Payment not fully received.<br /> All income supposed to be received on ' + income.enddate  + '!</p></div>';
		Status = paymentType == 1 ?  imgSchedule : imgCash ;
		Status=income.status==='✔'?strPaid:income.status==='Late'?strLate:(Date.parse(income.enddate)<Date.parse(new Date().toISOString().slice(0,10))?strComplete:strUnpaid);
		return Status;
	}
	getLoanTypeEditImage(loan){
		var imgEditSchedule, imgEditCash, paymentType, imgEditThisMonthPayment;
		imgEditSchedule = '<img src="assets/icon/planner64.png" >';
		imgEditCash = '<img src="assets/icon/cash50.png" >';
		paymentType= loan.paymenttype === 'Scheduled online banking payment' ? 1 : 0;
		imgEditThisMonthPayment = paymentType ==1 ? imgEditSchedule : imgEditCash; 		
		return imgEditThisMonthPayment;
	}
	getLoanProgress(loan){
		var ProgressInner,termPercentage,completedTerm,fullTerm,calc;
		calc = loan.progress.split(',');
		completedTerm = calc[1];fullTerm=calc[2];termPercentage=completedTerm>0?completedTerm/fullTerm*100:0;termPercentage = isNaN(termPercentage) ? 0 : termPercentage.toFixed(2);
		ProgressInner = ('').concat('<table class="loanProgressInner" align="left" height="100%" width="',       
									termPercentage,
									'%" ></table><div class="innerfloating"><p>',
									completedTerm,' of ',fullTerm, ' months paid. ',
									termPercentage,'% progressed</p></div>'
									);
		return ProgressInner;
	}
	getIncomeProgress(income){
		var ProgressInner,termPercentage,completedTerm,fullTerm,calc;
		calc = income.progress.split(',');
		completedTerm = calc[1];fullTerm=calc[2];termPercentage=completedTerm>0?completedTerm/fullTerm*100:0;termPercentage = isNaN(termPercentage) ? 0 : termPercentage.toFixed(2);
		ProgressInner = ('').concat('<table class="incomeProgressInner" align="left" height="100%" width="',       
									termPercentage,
									'%" ></table><div class="innerfloating"><p>',
									completedTerm,' of ',fullTerm, ' months received payment. ',
									termPercentage,'% progressed</p></div>'
									);
		return ProgressInner;
	}
	printObject(o){
		var out = '';for (var p in o) {out += p + ': ' + o[p] + '\n';}
		alert(out);
	}
	menuvisibility(){
		if (!(typeof this.slidingItem === 'undefined' || this.slidingItem === null)) {
			this.slidingItem.close();
		}
		this.handleMenu();
		this.menufab.close();
		this.registerbackbtn();
	}
	assignmenuFab(fab: FabContainer){
		this.menufab=fab;
		return true;
	}
	assingSlider(slidingItem,item){
		if (slidingItem.getSlidingPercent()>=1){
			if (!(typeof this.slidingItem === 'undefined' || this.slidingItem === null)) {
				if (this.slidingItem!=slidingItem){this.slidingItem.close();}
			}
			this.slidingItem=slidingItem;	
			document.getElementById("fabbutton").style.cssText="opacity:0;-webkit-animation: listOut 0.5s 1;";	
			setTimeout(() => {document.getElementById("fabbutton").style.cssText="visibility:hidden;";}, 500);
		}
		setTimeout(() => {
			if (this.slidingItem.getSlidingPercent()==0){document.getElementById("fabbutton").style.cssText="visibility:yes;";}
		}, 500);
	}
	showMenu(slidingItem){
		this.getData();	
		if (!(typeof this.slidingItem === 'undefined' || this.slidingItem === null)) {
			if (this.slidingItem!=slidingItem){this.slidingItem.close();}
		}		
		document.getElementById("fabbutton").style.cssText="visibility:yes;";
		document.getElementById("fabbutton").style.cssText="opacity:1;-webkit-animation: listIn 0.5s 1;";
	}
	changeDateRange(action){
		this.menufab.close();
		if (action===''){
			this.showMenu(this.slidingItem);
			this.changedateHiddenState=!this.changedateHiddenState;	
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
