package com.springboot.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.lang.reflect.Executable;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiry}")
    private long expiry;

    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UUID userId,String email){
        return Jwts.builder()
                .subject(email) //identity
                .claim("user_id",userId.toString())  //extra data inside token
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expiry))
                .signWith(getSigningKey())
                .compact();
    }


    private Claims getClaims(String token){
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token){
        return getClaims(token).getSubject();
    }
    public UUID extractUserid(String token){
        return UUID.fromString(getClaims(token).get("userId", String.class));
    }

    public boolean isTokenValid(String token){
        try{
            getClaims(token);
            return true;
        }catch (Exception e){
            return false;
        }
    }

}
