package gcm.com.study.draco.gcmstudy;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by Draco CHAU on 4/8/2015.
 */
public class HttpConnectionHelper {


    public String post(String path, byte[] payload) throws Exception {
        URL url = new URL(path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setInstanceFollowRedirects(false);
        conn.setDoInput(true);
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("content-Type", "application/json; charset=UTF-8");

        try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
            wr.write(payload);
        }

        int responseCode = conn.getResponseCode();
        if (responseCode == 200) {
            return readStringFormInputStream(conn.getInputStream());
        } else {
            String error = readStringFormInputStream(conn.getErrorStream());
            throw new Exception(String.format("Response error (%d): %s", responseCode, error));
        }
    }

    private String readStringFormInputStream(InputStream is) throws Exception{
        StringBuilder sb = new StringBuilder();
        BufferedReader br = new BufferedReader(new InputStreamReader(is));
        String output;
        while ((output = br.readLine()) != null) {
            sb.append(output);
        }
        return sb.toString();
    }

}
