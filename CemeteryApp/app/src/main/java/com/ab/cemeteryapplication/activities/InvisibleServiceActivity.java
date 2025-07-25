package com.ab.cemeteryapplication.activities;

import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;

import androidx.appcompat.app.AppCompatActivity;

import com.ab.cemeteryapplication.R;

import java.util.Locale;

public class InvisibleServiceActivity extends AppCompatActivity {

    private TextToSpeech textToSpeech = null;
    private String receivedText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_invisible_service);

        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            receivedText = bundle.getString(Intent.EXTRA_PROCESS_TEXT);
        }
        textToSpeech = new TextToSpeech(this, status -> {
            textToSpeech.setLanguage(Locale.ENGLISH);
            textToSpeech.speak(receivedText, TextToSpeech.QUEUE_FLUSH, null,
                    "serviceTextToSpeech");
            finish();
        });
    }
}