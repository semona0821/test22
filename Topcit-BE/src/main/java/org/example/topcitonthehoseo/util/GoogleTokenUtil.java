package org.example.topcitonthehoseo.util;

import java.util.Collections;

import org.springframework.stereotype.Component;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.util.Utils;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;


@Component
public class GoogleTokenUtil {

    private static final String CLIENT_ID = "589256795370-pmbqkjnq6h9s09uv1uhi489t9qe1r6bl.apps.googleusercontent.com";
    private static final JsonFactory jsonFactory = Utils.getDefaultJsonFactory();

    public String getEmailFromGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), jsonFactory)
                    .setAudience(Collections.singletonList(CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload().getEmail();
            } else {
                throw new RuntimeException("Invalid ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Google ID Token verification failed", e);
        }
    }
}