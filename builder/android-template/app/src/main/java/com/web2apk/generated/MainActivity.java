package __PACKAGE_NAME__;
import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebStorage;
import androidx.core.app.NotificationCompat;
__ONESIGNAL_IMPORT__
public class MainActivity extends Activity {
    private WebView webView;
    private static final String ONE_SIGNAL_APP_ID="__ONESIGNAL_APP_ID__";
    private static final String STORAGE_MODE="__STORAGE_MODE__";
    private static final String[] RUNTIME_PERMISSIONS=__RUNTIME_PERMISSIONS__;
    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state){super.onCreate(state);getWindow().setStatusBarColor(Color.parseColor("__THEME_COLOR__"));
        if(__FULLSCREEN__)getWindow().getDecorView().setSystemUiVisibility(5894);
        setContentView(R.layout.activity_main);View splash=findViewById(R.id.splash);if(__SPLASH_ENABLED__){splash.setVisibility(View.VISIBLE);splash.postDelayed(()->splash.setVisibility(View.GONE),__SPLASH_DURATION__);}requestSelectedPermissions();
        __ONESIGNAL_INIT__
        webView=findViewById(R.id.webview);WebSettings s=webView.getSettings();boolean ephemeral="ephemeral".equals(STORAGE_MODE),lowStorage="low".equals(STORAGE_MODE);s.setJavaScriptEnabled(true);s.setDomStorageEnabled(!ephemeral);s.setDatabaseEnabled(!ephemeral);if(lowStorage||ephemeral){s.setCacheMode(WebSettings.LOAD_NO_CACHE);webView.clearCache(true);}if(ephemeral){WebStorage.getInstance().deleteAllData();CookieManager.getInstance().removeAllCookies(null);CookieManager.getInstance().flush();}s.setAllowFileAccess(__ALLOW_FILE__);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setSupportZoom(__ALLOW_ZOOM__);s.setBuiltInZoomControls(__ALLOW_ZOOM__);s.setDisplayZoomControls(false);String ua="__CUSTOM_USER_AGENT__";if(!ua.isEmpty())s.setUserAgentString(ua);
        webView.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return false;}});
        webView.setWebChromeClient(new WebChromeClient(){@Override public void onPermissionRequest(PermissionRequest request){runOnUiThread(()->request.grant(request.getResources()));}@Override public void onGeolocationPermissionsShowPrompt(String origin,GeolocationPermissions.Callback callback){callback.invoke(origin,true,false);}});
        if(state==null)webView.loadUrl("__START_URL__");else webView.restoreState(state);showWelcomeNotification();
    }
    private void requestSelectedPermissions(){if(Build.VERSION.SDK_INT>=23&&RUNTIME_PERMISSIONS.length>0){java.util.ArrayList<String> missing=new java.util.ArrayList<>();for(String p:RUNTIME_PERMISSIONS)if(checkSelfPermission(p)!=PackageManager.PERMISSION_GRANTED)missing.add(p);if(!missing.isEmpty())requestPermissions(missing.toArray(new String[0]),100);}}
    private void showWelcomeNotification(){if(!__WELCOME_ENABLED__||getPreferences(MODE_PRIVATE).getBoolean("welcomed",false))return;String channel="web2apk_default";NotificationManager nm=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);if(Build.VERSION.SDK_INT>=26)nm.createNotificationChannel(new NotificationChannel(channel,"General",NotificationManager.IMPORTANCE_DEFAULT));Intent intent=new Intent(this,MainActivity.class);PendingIntent pi=PendingIntent.getActivity(this,0,intent,PendingIntent.FLAG_IMMUTABLE|PendingIntent.FLAG_UPDATE_CURRENT);NotificationCompat.Builder n=new NotificationCompat.Builder(this,channel).setSmallIcon(R.drawable.app_icon).setContentTitle("__WELCOME_TITLE__").setContentText("__WELCOME_BODY__").setAutoCancel(true).setContentIntent(pi);nm.notify(1001,n.build());getPreferences(MODE_PRIVATE).edit().putBoolean("welcomed",true).apply();}
    @Override protected void onSaveInstanceState(Bundle state){webView.saveState(state);super.onSaveInstanceState(state);}
    @Override public void onBackPressed(){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
    @Override public void onTrimMemory(int level){super.onTrimMemory(level);if(level>=TRIM_MEMORY_BACKGROUND&&!"normal".equals(STORAGE_MODE)&&webView!=null)webView.clearCache(true);}
    @Override protected void onDestroy(){if(!"normal".equals(STORAGE_MODE))webView.clearCache(true);if("ephemeral".equals(STORAGE_MODE)){WebStorage.getInstance().deleteAllData();CookieManager.getInstance().removeAllCookies(null);}webView.destroy();super.onDestroy();}
}
