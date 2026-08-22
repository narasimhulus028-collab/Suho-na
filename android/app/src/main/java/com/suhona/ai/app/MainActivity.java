package com.suhona.ai.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleReferralIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleReferralIntent(intent);
    }

    private void handleReferralIntent(Intent intent) {
        Uri uri = intent.getData();
        if (uri != null) {
            getPreferences(MODE_PRIVATE)
                .edit()
                .putString("referral_code", uri.getQueryParameter("code"))
                .apply();
        }
    }
}
