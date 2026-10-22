from pathlib import Path
r=Path("project")
f={
"settings.gradle":'pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\ndependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS); repositories { google(); mavenCentral() } }\nrootProject.name = "Regain"\ninclude(":app")\n',
"build.gradle":"plugins { id 'com.android.application' version '8.7.3' apply false; id 'org.jetbrains.kotlin.android' version '2.0.21' apply false }\n",
"gradle.properties":"org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\n",
"app/build.gradle":"plugins { id 'com.android.application'; id 'org.jetbrains.kotlin.android' }\nandroid { namespace 'com.regain.app'; compileSdk 36; compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }; kotlinOptions { jvmTarget = '17' }; defaultConfig { applicationId 'com.regain.app'; minSdk 26; targetSdk 35; versionCode 2; versionName '1.0.0' } }\n",
"app/src/main/AndroidManifest.xml":'<manifest xmlns:android="http://schemas.android.com/apk/res/android"><uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"/><uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"/><application android:allowBackup="true" android:label="Regain" android:theme="@style/AppTheme"><activity android:name=".MainActivity" android:exported="true"><intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter></activity><service android:name=".FocusAccessibilityService" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" android:exported="false" android:label="Regain Focus Control"><intent-filter><action android:name="android.accessibilityservice.AccessibilityService"/></intent-filter><meta-data android:name="android.accessibilityservice" android:resource="@xml/accessibility_service_config"/></service></application></manifest>',
"app/src/main/res/values/styles.xml":'<resources><style name="AppTheme" parent="@android:style/Theme.Material.NoActionBar"><item name="android:fontFamily">sans</item><item name="android:colorAccent">#A78BFA</item><item name="android:statusBarColor">#0B0B12</item><item name="android:navigationBarColor">#0B0B12</item><item name="android:windowLightStatusBar">false</item><item name="android:windowBackground">#0B0B12</item></style></resources>',
"app/src/main/res/values/strings.xml":'<resources><string name="app_name">Regain</string><string name="accessibility_description">During focus, return Home when a selected distracting app opens.</string></resources>',
"app/src/main/res/xml/accessibility_service_config.xml":'<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android" android:accessibilityEventTypes="typeWindowStateChanged" android:accessibilityFeedbackType="feedbackGeneric" android:notificationTimeout="250" android:canRetrieveWindowContent="false" android:description="@string/accessibility_description"/>',
"app/src/main/java/com/regain/app/FocusAccessibilityService.kt":'''package com.regain.app
import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.os.SystemClock
class FocusAccessibilityService : AccessibilityService() {
 private var lastPkg = ""; private var lastAt = 0L
 override fun onAccessibilityEvent(event: AccessibilityEvent?) {
  val pkg = event?.packageName?.toString() ?: return
  if (pkg == packageName || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
  val p = getSharedPreferences("regain", MODE_PRIVATE)
  if (!p.getBoolean("focus_active", false)) return
  if (System.currentTimeMillis() >= p.getLong("focus_until", 0L)) { p.edit().putBoolean("focus_active", false).apply(); return }
  val blocked = p.getStringSet("blocked_packages", emptySet()) ?: emptySet()
  if (!blocked.contains(pkg)) return
  val now = SystemClock.elapsedRealtime()
  if (pkg == lastPkg && now-lastAt < 1800L) return
  lastPkg = pkg; lastAt = now
  performGlobalAction(GLOBAL_ACTION_HOME)
 }
 override fun onInterrupt() {}
}
''',
"app/src/main/java/com/regain/app/MainActivity.kt":'''package com.regain.app
import android.app.Activity
import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.widget.*
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.TimeUnit
class MainActivity : Activity() {
 private val bg=Color.rgb(11,11,18); private val panel=Color.rgb(24,24,38); private val purple=Color.rgb(167,139,250); private val white=Color.rgb(245,243,255); private val muted=Color.rgb(166,163,184)
 private lateinit var root: LinearLayout
 private val prefs by lazy { getSharedPreferences("regain", MODE_PRIVATE) }
 override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); render() }
 override fun onResume() { super.onResume(); if (::root.isInitialized) render() }
 private fun dp(n:Int)=(n*resources.displayMetrics.density).toInt()
 private fun shape(c:Int,r:Int)=GradientDrawable().apply { setColor(c); cornerRadius=dp(r).toFloat() }
 private fun label(s:String,size:Float,c:Int=white,b:Boolean=false)=TextView(this).apply { text=s; textSize=size; setTextColor(c); if(b)setTypeface(null,Typeface.BOLD); setLineSpacing(dp(2).toFloat(),1f) }
 private fun card()=LinearLayout(this).apply { orientation=1; background=shape(panel,22); setPadding(dp(18),dp(18),dp(18),dp(18)); layoutParams=LinearLayout.LayoutParams(-1,-2).apply { bottomMargin=dp(14) } }
 private fun btn(s:String,primary:Boolean=false,action:()->Unit)=TextView(this).apply { text=s; textSize=14f; typeface=Typeface.DEFAULT_BOLD; gravity=Gravity.CENTER; setTextColor(if(primary)bg else white); background=shape(if(primary)purple else Color.rgb(48,45,67),15); setPadding(dp(14),dp(14),dp(14),dp(14)); isClickable=true; setOnClickListener{action()} }
 private fun gap(v:LinearLayout,h:Int=10){v.addView(View(this),LinearLayout.LayoutParams(1,dp(h)))}
 private fun addBtn(v:LinearLayout,s:String,p:Boolean=false,action:()->Unit){v.addView(btn(s,p,action),LinearLayout.LayoutParams(-1,-2).apply{topMargin=dp(9)})}
 private fun usageAllowed():Boolean { val a=getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager; return try{a.checkOpNoThrow("android:get_usage_stats",android.os.Process.myUid(),packageName)==AppOpsManager.MODE_ALLOWED}catch(_:Exception){false} }
 private fun serviceEnabled():Boolean { val s=Settings.Secure.getString(contentResolver,Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)?:return false; val target=packageName+"/"+FocusAccessibilityService::class.java.name; return s.split(':').any{it.equals(target,true)} }
 private fun active()=prefs.getBoolean("focus_active",false)&&System.currentTimeMillis()<prefs.getLong("focus_until",0L)
 private fun remaining():String {val m=(prefs.getLong("focus_until",0L)-System.currentTimeMillis()).coerceAtLeast(0L);return String.format(Locale.getDefault(),"%02d:%02d",TimeUnit.MILLISECONDS.toMinutes(m),TimeUnit.MILLISECONDS.toSeconds(m)%60)}
 private fun render(){
  val sc=ScrollView(this).apply{setBackgroundColor(bg);clipToPadding=false};root=LinearLayout(this).apply{orientation=1;setPadding(dp(20),dp(24),dp(20),dp(28))};sc.addView(root);setContentView(sc)
  root.addView(label("REGAIN  /  FOCUS BETTER",12f,purple,true));gap(root,9);root.addView(label("Take back your\\nfocus.",30f,white,true));gap(root,5);root.addView(label("Less scrolling. More of what matters.",14f,muted));gap(root,22)
  val f=card();f.addView(label(if(active())"FOCUS SESSION ACTIVE" else "YOUR FOCUS SPACE",12f,purple,true));gap(f,12);f.addView(label(if(active())remaining() else "25:00",48f,white,true));gap(f,5);f.addView(label(if(active())"Selected distracting apps are restricted." else "One session. One thing at a time.",14f,muted));addBtn(f,if(active())"End focus session" else "Start 25-minute focus",true){if(active())prefs.edit().putBoolean("focus_active",false).apply()else prefs.edit().putLong("focus_until",System.currentTimeMillis()+25*60*1000L).putBoolean("focus_active",true).apply();render()};root.addView(f)
  val setup=card();setup.addView(label("QUICK SETUP",17f,white,true));gap(setup,4);setup.addView(label("Android permissions are required for usage insights and app restriction.",13f,muted))
  addBtn(setup,(if(usageAllowed())"✓ "else"① ")+"Usage Access"+if(usageAllowed())" enabled"else" — enable"){startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))}
  addBtn(setup,(if(serviceEnabled())"✓ "else"② ")+"Accessibility control"+if(serviceEnabled())" enabled"else" — enable"){startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)}
  if(!usageAllowed()||!serviceEnabled()){gap(setup,7);setup.addView(label("Accessibility can observe which app opens. Enable it only if you are comfortable. Restriction needs both permissions.",12f,muted))};root.addView(setup)
  val a=card();a.addView(label("DISTRACTING APPS",18f,white,true));gap(a,4);a.addView(label("Select apps to send back to Home during focus.",13f,muted));addBtn(a,"Refresh app list"){render()};root.addView(a)
  if(!usageAllowed())a.addView(label("Enable Usage Access above, return here and refresh.",13f,muted))else{
   val rows=usage().filter{it.first!=packageName&&it.second>0}.take(18)
   if(rows.isEmpty())a.addView(label("No usage data yet. Open a few apps, then refresh.",13f,muted))
   val selected=(prefs.getStringSet("blocked_packages",emptySet())?:emptySet()).toMutableSet()
   for((pkg,ms) in rows){val row=LinearLayout(this).apply{orientation=0;gravity=Gravity.CENTER_VERTICAL;setPadding(0,dp(10),0,dp(10))};val name=try{packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg,0)).toString()}catch(_:Exception){pkg};val col=LinearLayout(this).apply{orientation=1};col.addView(label(name,14f,white,true));col.addView(label(duration(ms),12f,muted));row.addView(col,LinearLayout.LayoutParams(0,-2,1f));row.addView(CheckBox(this).apply{buttonTintList=android.content.res.ColorStateList.valueOf(purple);isChecked=selected.contains(pkg);setOnCheckedChangeListener{_,checked->val set=(prefs.getStringSet("blocked_packages",emptySet())?:emptySet()).toMutableSet();if(checked)set.add(pkg)else set.remove(pkg);prefs.edit().putStringSet("blocked_packages",set).apply()}});a.addView(row);a.addView(View(this).apply{setBackgroundColor(Color.rgb(49,46,66))},LinearLayout.LayoutParams(-1,dp(1)))}
   gap(a,5);a.addView(label("Selected apps: "+selected.size,12f,purple,true))
  }
  val st=card();st.addView(label("TODAY'S SNAPSHOT",17f,white,true));gap(st,8);st.addView(label("Tracked screen time  ·  "+duration(usage().sumOf{it.second}),15f,white,true));gap(st,4);st.addView(label("Usage totals are supplied by Android and can vary by device.",12f,muted));root.addView(st)
  val set=card();set.addView(label("SETTINGS",17f,white,true));addBtn(set,"Open Regain app settings"){startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+packageName)))};addBtn(set,"Refresh dashboard"){render()};root.addView(set);root.addView(label("Regain • 1.0.0",12f,muted).apply{gravity=Gravity.CENTER})
 }
 private fun usage():List<Pair<String,Long>>{if(!usageAllowed())return emptyList();return try{val c=Calendar.getInstance();c.set(Calendar.HOUR_OF_DAY,0);c.set(Calendar.MINUTE,0);c.set(Calendar.SECOND,0);c.set(Calendar.MILLISECOND,0);val m=getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager;m.queryUsageStats(UsageStatsManager.INTERVAL_DAILY,c.timeInMillis,System.currentTimeMillis()).groupBy{it.packageName}.map{e->e.key to (e.value.maxOfOrNull{it.totalTimeInForeground}?:0L)}.sortedByDescending{it.second}}catch(_:Exception){emptyList()}}
 private fun duration(ms:Long):String{val n=TimeUnit.MILLISECONDS.toMinutes(ms);return if(n>=60)(n/60).toString()+"h "+(n%60)+"m"else n.toString()+"m"}
}
'''
}
for n,c in f.items():
 p=r/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(c,encoding="utf-8")
print("Generated integrated Regain Android project with",len(f),"files")
