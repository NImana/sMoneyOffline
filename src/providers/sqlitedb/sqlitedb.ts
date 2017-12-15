import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import * as moment from 'moment';

/*
  Generated class for the SqlitedbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SqlitedbProvider {
	db: SQLiteObject;
	dbName = 'sMoneyOffline.db';
	constructor(public http: Http,private sqlite: SQLite) {
    console.log('Hello SqlitedbProvider Provider');
  }
    initDB(){
	  this.openDB().then(() => {
        //call createTable method 
        var sMoneycolumns = 'transactionID INTEGER PRIMARY KEY, ' +
							'typeID INTEGER, ' +
							'transactiondate REAL, ' +
							'type TEXT, ' +
							'amount REAL, ' +
							'bankName TEXT';							
        var Loanscolumns =  'typeID INTEGER PRIMARY KEY, ' +
							'title TEXT, ' +
							'monthlyamount REAL, ' + 
							'startdate REAL, ' +
							'enddate REAL, ' +
							'monthlypaymentday TEXT, ' +
							'paymenttype TEXT, ' +
							'bankName TEXT, ' +
							'progress TEXT, ' +
							'notiDaysBefore TEXT';							
        var Incomecolumns = 'typeID INTEGER PRIMARY KEY, ' +
							'title TEXT, ' +
							'monthlyamount REAL, ' + 
							'startdate REAL, ' +
							'enddate REAL, ' +
							'monthlypaymentday TEXT, ' +
							'paymenttype TEXT, ' +
							'bankName TEXT, ' +
							'progress TEXT';
        var Expensecolumns ='typeID INTEGER PRIMARY KEY, ' +
							'title TEXT, ' +
							'amount REAL, ' + 
							'paymenttype TEXT, ' +
							'bankName TEXT';							
        var Bonuscolumns =  'typeID INTEGER PRIMARY KEY, ' +
							'title TEXT, ' +
							'amount REAL, ' + 
							'paymenttype TEXT, ' +
							'bankName TEXT'	;							
        var Trackcolumns =	'typeID INTEGER, ' +
							'type TEXT, ' +
							'year REAL, ' +
							'month REAL, ' + 
							'status TEXT, ' +
							'transactionID INTEGER';	
	    //this.dropTable('sMoneyOffline');		
        //this.dropTable('Loans');		
        //this.dropTable('Incomes');		
        //this.dropTable('Expenses');		
        //this.dropTable('Bonuses');		
        //this.dropTable('Tracking');											
        this.createTable('sMoneyOffline',sMoneycolumns);		
        this.createTable('Loans',Loanscolumns);		
        this.createTable('Incomes',Incomecolumns);		
        this.createTable('Expenses',Expensecolumns);		
        this.createTable('Bonuses',Bonuscolumns);		
        this.createTable('Tracking',Trackcolumns); 
      });  
	}
	public openDB(): Promise<void>{
	return this.sqlite.create({
		  name: this.dbName,
		  location: 'default'
		})
		.then( (db: SQLiteObject) => {
		  //storage object to property
		  this.db = db; 
		});
	}
	public dropTable(tableName): Promise<void>{
	//you can access to method executeSql now
	return this.db.executeSql('DROP TABLE IF EXISTS ' + tableName, {});
	}	
	public createTable(tableName,tableColumns): Promise<void>{
	//you can access to method executeSql now
	return this.db.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + '(' + tableColumns + ')', {});
	}	
	getSummary(dateRange){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT type, SUM(amount) AS total FROM sMoneyOffline WHERE  transactiondate>=? AND transactiondate<=? GROUP BY type ORDER BY type', dateRange).
				then((data) => {
				let summary = [];
				for(let i = 0; i < data.rows.length; i++) {
					summary.push({
						type:data.rows.item(i).type,
						total:data.rows.item(i).total
					});
				}
                resolve(summary);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getScheduled(type){       
		var currDate=new Date();
		var data;
		return new Promise(resolve => {
			this.openDB().then(() => {
			data = [type,currDate.getFullYear(),currDate.getMonth()+1];
				this.db.executeSql(	'SELECT ' +
									'l.*,t.status ' + 
									'FROM '+type+'s l LEFT JOIN Tracking t ' + 
									'ON l.typeID=t.typeID AND t.type=? AND year=? AND month=?' +
									'ORDER BY l.typeID DESC', data)
				.then(res => {
					let expenses = [];
					for(var i=0; i<res.rows.length; i++) {						
						expenses.push({
							typeid:res.rows.item(i).typeID,
							title:res.rows.item(i).title,
							monthlyamount:res.rows.item(i).monthlyamount,
							startdate:new Date(res.rows.item(i).startdate).toISOString().slice(0,10),
							enddate:new Date(res.rows.item(i).enddate).toISOString().slice(0,10),
							monthlypaymentday:res.rows.item(i).monthlypaymentday,
							paymenttype:res.rows.item(i).paymenttype,
							bankName:res.rows.item(i).bankName,
							progress:res.rows.item(i).progress,
							status:res.rows.item(i).status,
							notiDaysBefore:res.rows.item(i).notiDaysBefore
						})
					}
				  resolve(expenses);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	gettrackyear(data){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT year FROM Tracking WHERE typeID=? AND type=? GROUP BY year', data).
				then((data) => {
				let years = [];
					for(var i=0; i<data.rows.length; i++) {						
						years.push(data.rows.item(i).year)
				  }
				resolve(years);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getTracking(data){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT * FROM Tracking WHERE typeID=? AND type=? and year=? ORDER BY month DESC', data)
				.then(res => {
					let track = [];
					for(var i=0; i<res.rows.length; i++) {						
						track.push({
							typeid : res.rows.item(i).typeID,
							type: res.rows.item(i).type,
							year:res.rows.item(i).year,
							month:res.rows.item(i).month,
							status:res.rows.item(i).status,
							transactionID:res.rows.item(i).transactionID
						})
				  }
				  resolve(track);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getTransactions(){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT * FROM sMoneyOffline ORDER BY transactiondate DESC', [])
				.then(res => {
					let transaction = [];
					for(var i=0; i<res.rows.length; i++) {						
						transaction.push({
							transactionID:res.rows.item(i).transactionID,
							typeid : res.rows.item(i).typeID,
							type: res.rows.item(i).type,
							transactiondate:new Date(res.rows.item(i).transactiondate).toISOString().slice(0,10),
							amount:res.rows.item(i).amount,
							bankName:res.rows.item(i).bankName})
				  }
				  resolve(transaction);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getTransactionsTracking(transactionID){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT * FROM Tracking WHERE transactionID=?', [transactionID])
				.then(res => {
					let transaction = [];
					for(var i=0; i<res.rows.length; i++) {						
						transaction.push({
							typeid : res.rows.item(i).typeID,
							type: res.rows.item(i).type,
							year:res.rows.item(i).year,
							month:res.rows.item(i).month,
							status:res.rows.item(i).status,
							transactionID:res.rows.item(i).transactionID})
				  }
				  resolve(transaction);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getBonusAndExpense(){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql(	'SELECT e.title,"Expense" AS type,e.typeID AS transactionID FROM Expenses e '+
									'UNION ALL '+
									'SELECT b.title,"Bonus" AS type,b.typeID AS transactionID FROM Bonuses b ', [])
				.then(res => {
					let transaction = [];
					for(var i=0; i<res.rows.length; i++) {						
						transaction.push({
							title:res.rows.item(i).title,
							type : res.rows.item(i).type,
							transactionID: res.rows.item(i).transactionID})
				  }
				  resolve(transaction);
				})
				.catch(e => resolve(e));
			  });  
		});
	}
	getTransactionsDetails(data){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql(	'SELECT tr.*,s.title ' + 
									'FROM sMoneyOffline tr JOIN '+
									'(SELECT l.title,"Loan" AS type,t.transactionID FROM Loans l LEFT JOIN Tracking t ON l.typeID=t.typeID AND t.type="Loan" '+
									'UNION ALL '+
									'SELECT i.title,"Income" AS type,t.transactionID FROM Incomes i LEFT JOIN Tracking t ON i.typeID=t.typeID AND t.type="Income" '+
									'UNION ALL '+
									'SELECT e.title,"Expense" AS type,e.typeID AS transactionID FROM Expenses e '+
									'UNION ALL '+
									'SELECT b.title,"Bonus" AS type,b.typeID AS transactionID FROM Bonuses b '+
									') s '+
									'ON tr.transactionID=s.transactionID AND tr.type=s.type AND tr.transactiondate>=? AND tr.transactiondate<=? AND tr.amount<>0 ' +
									'ORDER BY transactiondate DESC', data)
				.then(res => {
					let transaction = [];
					for(var i=0; i<res.rows.length; i++) {						
						transaction.push({
							transactionID:res.rows.item(i).transactionID,
							typeid : res.rows.item(i).typeID,
							type: res.rows.item(i).type,
							transactiondate:new Date(res.rows.item(i).transactiondate),
							amount:res.rows.item(i).amount,
							bankName:res.rows.item(i).bankName,
							title:res.rows.item(i).title})
				  }
				  resolve(transaction);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getNewID(idColName,tableName){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT max('+idColName+') AS maxid FROM ' + tableName, []).
				then((data) => {
				let newID = [];
				newID[0] = data.rows.length>0 ? data.rows.item(0).maxid :0;
				resolve(newID);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getmaxdate(tableName){
		return new Promise(resolve => {
			this.openDB().then(() => {
				this.db.executeSql('SELECT max(startdate)  AS maxdate FROM ' + tableName, []).
				then((data) => {
				let maxdate = [];
					maxdate[0] = data.rows.length>0 ? data.rows.item(0).maxdate :0;
				resolve(maxdate);
				})
				.catch(e => console.log(e));
			  });  
		});
	}
	getpaymentDay(ls,mpd){
		var selDate=new Date(ls).getDate().toString();
		var paymentDay, lastChar;
		paymentDay = '1st';
		paymentDay = mpd;      
		paymentDay = paymentDay.replace('st','').replace('nd','').replace('rd','').replace('th',''); 
		paymentDay = paymentDay >= selDate ? paymentDay : selDate;
		lastChar = parseInt(paymentDay)>10 && parseInt(paymentDay)<20 ? 'th' : (paymentDay[paymentDay.length -1] === '1' ? 'st' : (paymentDay[paymentDay.length -1] === '2' ? 'nd' : (paymentDay[paymentDay.length -1] === '3' ? 'rd' : 'th')));
		paymentDay = paymentDay + lastChar;
		return paymentDay;  
	}
	getNextPaymentDate(startdate,enddate,payDay){
		var sd,ed,cy,cm,pday,pdate,npy,npm,npday,npdate,maxMonDay;
		sd=new Date(startdate);ed=new Date(enddate);
		cy=new Date().getFullYear();
		cm=(new Date().getMonth()+1)<=9?'0'+(new Date().getMonth()+1):(new Date().getMonth()+1);
		maxMonDay=[0,31,((cy % 4)==0?29:28),31,30,31,30,31,31,30,31,30,31];
		pday=parseInt(payDay)<=maxMonDay[parseInt(cm)]?parseInt(payDay):maxMonDay[parseInt(cm)];
		pday=pday<=9?'0'+pday:pday;	
		npy=cm==12?cy+1:cy;
		npm=cm==12?'01':(cm+1<=9?'0'+(cm+1):cm+1);
		npday=parseInt(pday)<=maxMonDay[parseInt(npm)]?pday:maxMonDay[parseInt(npm)];
		pdate=new Date(cy+'-'+cm+'-'+pday);	
		npdate=new Date(npy+'-'+npm+'-'+npday);
		npdate=pdate>(new Date(new Date().toISOString().slice(0,10)))?pdate:npdate;
		npdate=npdate<=sd?sd:npdate;
		npdate=npdate>=ed?ed:npdate;
		return npdate;		
	}
	addData(tableName,tableValues,data){	
	this.openDB().then(() => {
		this.db.executeSql('INSERT INTO ' + tableName + ' VALUES' + tableValues,data)
			.then(res => {
			  console.log(res);
			}).catch(e => console.log(e));
		});
		
		return true;
	}
	updateData(tableName,tableValues,data){	
		this.openDB().then(() => {
		this.db.executeSql('UPDATE ' + tableName + ' SET '  + tableValues + ' WHERE typeID=?',data)
			.then(res => {
			  console.log(res);
			}).catch(e => console.log(e));
		});
		return true;
	}
	updateTransactionData(tableValues,data){	
		this.openDB().then(() => {
		this.db.executeSql('UPDATE sMoneyOffline SET '  + tableValues + ' WHERE typeID=? AND type=?',data)
			.then(res => {
			  console.log(res);
			}).catch(e => console.log(e));
		});
		return true;
	}
	deleteData(tableName,typeID,type) {
		var typestr = type===''? '': ' AND type=?';
		var data =  type===''? [typeID] : [typeID,type];
		this.db.executeSql('DELETE FROM ' + tableName + ' WHERE typeID=?' + typestr, data)
		.then(res => {
		  console.log(res);
		})
		.catch(e => console.log(e));
	}
	cleanTrackingDetails(typeID,type,ndate,sym){
		var transactionsdate=Date.parse(ndate.toISOString().slice(0,10));
		var year = ndate.getFullYear();var month = ndate.getMonth()+1;
		this.db.executeSql('DELETE FROM sMoneyOffline WHERE '+
							'transactiondate'+sym+transactionsdate + ' AND '+
							'typeID='+typeID+' AND '+
							'type="'+type+'"', []).then(res => {console.log(res);}).catch(e => console.log(e));
		this.db.executeSql('DELETE FROM Tracking WHERE '+
							'((year'+sym+year+') OR '+
							'(year='+year+ ' AND '+ 'month'+sym+month+ ')) AND '+
							'typeID='+typeID+' AND '+
							'type="'+type+'"', []).then(res => {console.log(res);}).catch(e => console.log(e));
		this.db.executeSql('UPDATE Tracking SET status="-",transactionID=NULL WHERE typeID=? AND type=? AND transactionID IS NOT NULL AND transactionID NOT IN (SELECT transactionID from sMoneyOffline)' ,[typeID,type])
		.then(res => {console.log(res);}).catch(e => console.log(e));
	}
	deleteTransaction(data){
		this.db.executeSql('DELETE FROM sMoneyOffline WHERE '+
							'transactionID=('+
										'SELECT transactionID from Tracking WHERE '+
												'typeID=? AND '+
												'type=? AND '+
												'year=? AND '+
												'month=?)', data)
		.then(res => {
		  console.log(res);
		})
		.catch(e => console.log(e));		
	}
	createTrackingDetails(maxTansactionID,newid,type,startdate,enddate,payd,amount,bankname,action){
		var y,m,pd,sy,ey,sm,em,cy,cm,sd,ed,cd,cdd,currDate,trackingData,transactionData,momxDay;
		currDate = new Date();
		momxDay=[0,31,28,31,30,31,30,31,31,30,31,30,31];
		cdd = currDate.getDate().toString(); cdd = parseInt(cdd)<=9? '0'+cdd:cdd;
		sy = startdate.getFullYear(); ey = enddate.getFullYear(); cy = currDate.getFullYear();
		sm = startdate.getMonth()+1; em = enddate.getMonth()+1; cm = currDate.getMonth()+1;
		sm = sm<=9? '0'+sm:sm;em = em<=9? '0'+em:em;cm = cm<=9? '0'+cm:cm;
		pd = payd.replace('st','').replace('nd','').replace('rd','').replace('th',''); 
		pd = parseInt(pd)<=9 ? '0' + pd : pd;
		sd = Date.parse(sy+'-'+sm+'-'+pd);ed = Date.parse(ey+'-'+em+'-'+pd);cd = Date.parse(cy+'-'+cm+'-'+cdd);
		for (y = sy; y<=ey ; y++){
			momxDay[2]=(y % 4)==0?29:28;
			for (m = 1; m<=12 ; m++){
				var strm = m<=9 ? '0' + m : m;
				var cpd = pd<=momxDay[m]?pd:momxDay[m];
				var d = Date.parse(y+'-'+strm+'-'+cpd);
				if (action === 'create'){
					if (d>=sd && d<=ed && d<cd){
						maxTansactionID=maxTansactionID+1;
						trackingData = [newid,type,y,m,'✔',maxTansactionID];
						this.addData('Tracking','(?,?,?,?,?,?)',trackingData);
						transactionData=[maxTansactionID,newid,d,type,amount,bankname];
						this.addData('sMoneyOffline','(?,?,?,?,?,?)', transactionData);
					}
					if (d>=sd && d<=ed && d>=cd){
						trackingData = [newid,type,y,m,'-'];
						this.addData('Tracking','(?,?,?,?,?,?)',trackingData);
					}
				}
				if (action === 'updatestart'){
					if (d>=sd && d<ed && d<=cd){
						maxTansactionID=maxTansactionID+1;
						trackingData = [newid,type,y,m,'✔',maxTansactionID];
						this.addData('Tracking','(?,?,?,?,?,?)',trackingData);
						transactionData=[maxTansactionID,newid,d,type,amount,bankname];
						this.addData('sMoneyOffline','(?,?,?,?,?,?)', transactionData);
					}
					if (d>=sd && d<ed && d>cd){
						trackingData = [newid,type,y,m,'-'];
						this.addData('Tracking','(?,?,?,?,?,?)',trackingData);
					}
				}
				if (action === 'updateend'){
					if (d>sd && d<=ed && d<=cd){
						maxTansactionID=maxTansactionID+1;
						trackingData = [newid,type,y,m,'✔',maxTansactionID];
						this.addData('Tracking','(?,?,?,?,?,?)',trackingData);
						transactionData=[maxTansactionID,newid,d,type,amount,bankname];
						this.addData('sMoneyOffline','(?,?,?,?,?,?)', transactionData);
					}
					if (d>sd && d<=ed && d>cd){
						trackingData = [newid,type,y,m,'-'];
						this.addData('Tracking','(?,?,?,?,?,?)',trackingData);
					}
				}
			} 			
		} 
		this.refreshProgress();
		return maxTansactionID;
	}
	updateTrackingData(tableName,tableValues,data){	
		this.openDB().then(() => {
			this.db.executeSql('UPDATE ' + tableName + ' SET '  + tableValues + ' WHERE typeID=? AND type=? AND year=? AND month=?',data)
				.then(res => {
				  console.log(res);
				}).catch(e => console.log(e));
		});
		this.refreshProgress();
		return true;
	}
	refreshProgress(){
		this.openDB().then(() => {
			this.db.executeSql(	'SELECT (typeID||type) as ttid,typeID, type, SUM(CASE WHEN instr(status,"✔")>0 THEN 1 ELSE 0 END) as progress,SUM(CASE WHEN status="Late" THEN 1 ELSE 0 END) as late, COUNT(typeID) as totalmonth from Tracking GROUP BY ttid',[])
			.then(res => {
				for(var i=0; i<res.rows.length; i++) {	
					var data=[res.rows.item(i).late+','+res.rows.item(i).progress+','+res.rows.item(i).totalmonth,res.rows.item(i).typeID];
					this.updateData(res.rows.item(i).type+'s','progress=?',data)
				}
			})
			.catch(e => console.log(e));
		});
		return true;
	}
	getTrackingToUpdate(){
		var year,month;
		year=new Date().getFullYear(); month=new Date().getMonth()+1;
		return new Promise(resolve => {	
			this.openDB().then(() => {
				this.db.executeSql(	'SELECT t.*,s.monthlypaymentday,s.amount,s.bankName '+
									'FROM Tracking t ,'+
									'(SELECT typeID, monthlypaymentday,monthlyamount as amount,bankName, "Loan" AS type FROM Loans '+
									'UNION ALL '+
									'SELECT typeID, monthlypaymentday,monthlyamount as amount,bankName, "Income" AS type FROM Incomes) s '+
									'WHERE t.typeID=s.typeID AND t.type=s.type AND t.status="-" '+
									'AND ((t.year<'+year+') OR (t.year='+year+' AND t.month<='+month+'))', [])
				.then(res => {
					let track = [];
					for(var i=0; i<res.rows.length; i++) {						
						track.push({
							typeid : res.rows.item(i).typeID,
							type: res.rows.item(i).type,
							year:res.rows.item(i).year,
							month:res.rows.item(i).month<=9?'0'+res.rows.item(i).month:res.rows.item(i).month,
							status:res.rows.item(i).status,
							transactionID:res.rows.item(i).transactionID,
							monthlypaymentday:parseInt(res.rows.item(i).monthlypaymentday)<=9?'0'+parseInt(res.rows.item(i).monthlypaymentday):parseInt(res.rows.item(i).monthlypaymentday),
							amount:res.rows.item(i).amount,
							bankName:res.rows.item(i).bankName							
						})
					}
					resolve(track);
				})
				.catch(e => resolve(e));
			}); 
		});
	}
}
