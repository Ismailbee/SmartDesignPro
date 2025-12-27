package com.smartdesignpro.ican;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    // CRITICAL: Enable WebView debugging for chrome://inspect
    WebView.setWebContentsDebuggingEnabled(true);
    
    super.onCreate(savedInstanceState);
  }
}
