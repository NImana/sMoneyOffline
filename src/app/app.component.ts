import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar} from '@ionic-native/status-bar';
//import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SqlitedbProvider } from '../providers/sqlitedb/sqlitedb';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  constructor(
				platform: Platform, 
				statusBar: StatusBar, 
				splashScreen: SplashScreen,				
				public smoneydb: SqlitedbProvider) {
    platform.ready().then(() => {     
      statusBar.styleDefault();
      splashScreen.hide();  
	  this.smoneydb.initDB();   
    });
  }
  
 
}

