package com.marketplace.shared.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.marketplace..service..*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        log.debug("Executando: {}", methodName);
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            log.debug("Concluído: {} em {}ms", methodName, System.currentTimeMillis() - start);
            return result;
        } catch (Exception ex) {
            log.error("Erro em {}: {}", methodName, ex.getMessage());
            throw ex;
        }
    }
}
