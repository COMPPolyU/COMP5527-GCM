package gcm.com.study.draco.gcmstudy;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.gcm.GoogleCloudMessaging;

import org.json.JSONObject;

import java.io.IOException;
import java.nio.charset.Charset;


public class MainActivity extends ActionBarActivity {

    public static final String EXTRA_MESSAGE = "message";
    public static final String PROPERTY_REG_ID = "registration_id";
    private static final String PROPERTY_APP_VERSION = "appVersion";
    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;
    private static final String TAG = "GCM Smart Health";
    private final String SENDER_ID = "683099356452";

    private Context context;
    private String regid;
    private GoogleCloudMessaging gcm;
    private WebView webView;
    //private TextView mDisplay;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //mDisplay = (TextView) findViewById(R.id.display);
        webView = (WebView) findViewById(R.id.webView);
        context = getApplicationContext();
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webView.addJavascriptInterface(new JsWrapper(this), "Android");
        webView.loadUrl("file:///android_asset/www/index.html");
        //webView.loadUrl("http://www.simple-trade.net/");
    }

    public void webViewInteraction(final String javascript){
        if (webView != null){
            webView.post(new Runnable() {
                @Override
                public void run() {
                    webView.loadUrl("javascript:callFromActivity('" + javascript + "')");
                }
            });
        }
    }

    public class JsWrapper{
        Context mContext;
        public JsWrapper(Context c){
            this.mContext = c;
        }

        @JavascriptInterface
        public void toast(String message){
            Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public void register(String token){
            try {
                registerGCM(token);
            } catch (Exception e){
                Log.i(TAG, e.getMessage());
            }
        }

        @JavascriptInterface
        public boolean hasNetwork(){
            boolean status=false;
            try{
                ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
                NetworkInfo netInfo = cm.getNetworkInfo(0);
                if (netInfo != null && netInfo.getState()==NetworkInfo.State.CONNECTED) {
                    status= true;
                }else {
                    netInfo = cm.getNetworkInfo(1);
                    if(netInfo!=null && netInfo.getState()==NetworkInfo.State.CONNECTED)
                        status= true;
                }
            }catch(Exception e){
                e.printStackTrace();
                return false;
            }
            return status;
        }


    }

    private final void registerGCM(String token){
        if (checkPlayServices()) {
            gcm = GoogleCloudMessaging.getInstance(this);
            regid = getRegistrationId(context);
            if (regid.isEmpty()) {
                registerInBackground(token);
            }else{
                Log.i(TAG, "Already Registered");
                sendRegistrationIdToBackend(token);
            }
        } else {
            Log.i(TAG, "No valid Google Play Services APK found.");
        }
    }

    private String getRegistrationId(Context context) {
        final SharedPreferences prefs = getGcmPreferences(context);
        String registrationId = prefs.getString(PROPERTY_REG_ID, "");
        if (registrationId.isEmpty()) {
            Log.i(TAG, "Registration not found.");
            return "";
        }
        int registeredVersion = prefs.getInt(PROPERTY_APP_VERSION, Integer.MIN_VALUE);
        int currentVersion = getAppVersion(context);
        if (registeredVersion != currentVersion) {
            Log.i(TAG, "App version changed.");
            return "";
        }
        return registrationId;
    }

    private void registerInBackground(final String token) {
        new AsyncTask<Void, Void, String>() {
            @Override
            protected String doInBackground(Void... param) {
                String msg = "";
                try {
                    if (gcm == null) {
                        gcm = GoogleCloudMessaging.getInstance(context);
                    }
                    regid = gcm.register(SENDER_ID);
                    Log.i(TAG, "Registration ID=" + regid);
                    msg = "Device registered, registration ID=" + regid;
                    storeRegistrationId(context, regid);
                    sendRegistrationIdToBackend(token);
                } catch (IOException ex) {
                    msg = "Error :" + ex.getMessage();
                }
                return msg;
            }

            @Override
            protected void onPostExecute(String msg) {
                Log.i(TAG, msg);
            }
        }.execute(null, null, null);
    }

    private boolean checkPlayServices() {
        int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
                GooglePlayServicesUtil.getErrorDialog(resultCode, this,
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            } else {
                Log.i(TAG, "This device is not supported.");
                finish();
            }
            return false;
        }
        return true;
    }

    private void storeRegistrationId(Context context, String regId) {
        final SharedPreferences prefs = getGcmPreferences(context);
        int appVersion = getAppVersion(context);
        Log.i(TAG, "Saving regId on app version " + appVersion);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(PROPERTY_REG_ID, regId);
        editor.putInt(PROPERTY_APP_VERSION, appVersion);
        editor.commit();
    }

    private static int getAppVersion(Context context) {
        try {
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            return packageInfo.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            throw new RuntimeException("Could not get package name: " + e);
        }
    }

    private SharedPreferences getGcmPreferences(Context context) {
        return getSharedPreferences(MainActivity.class.getSimpleName(),
                Context.MODE_PRIVATE);
    }

    private void sendRegistrationIdToBackend(final String token) {
        new AsyncTask<Void, Void, String>() {
            @Override
            protected String doInBackground(Void... param) {
                try{
                    JSONObject holder = new JSONObject();
                    holder.put("token",token);
                    holder.put("deviceId", regid);
                    Log.i(TAG, holder.toString());
                    byte[] postData = holder.toString().getBytes(Charset.forName("UTF-8"));
                    HttpConnectionHelper helper = new HttpConnectionHelper();
                    String result = helper.post("http://smarthealth-comp5527.rhcloud.com/demo/rest/registerGCM", postData);
                    webViewInteraction("Reg OK!");
                    return result;
                } catch (Exception e){
                    Log.i(TAG, e.getMessage());
                    return "Send ID failure: " + e.getMessage();
                }

            }

            @Override
            protected void onPostExecute(String msg) {
                Log.i(TAG, msg);
            }
        }.execute(null, null, null);
    }

    @Override
    protected void onResume() {
        super.onResume();
        checkPlayServices(); // Check device for Play Services APK.
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        //getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
//        int id = item.getItemId();
//        if (id == R.id.action_settings) {
//            return true;
//        }
        return super.onOptionsItemSelected(item);
    }
}
