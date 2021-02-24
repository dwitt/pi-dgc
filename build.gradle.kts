import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "2.4.2"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    kotlin("jvm") version "1.4.21"
    kotlin("plugin.spring") version "1.4.21"
    id("com.github.johnrengelman.shadow") version "5.0.0"
}

group = "sh.ellis"
//version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-websocket") {
        exclude(module = "spring-boot-starter-json")
        exclude(group = "org.hibernate.validator", module = "hibernate-validator")
        exclude(module = "spring-boot-starter-actuator")
    }

    implementation("org.springframework.boot:spring-boot-starter-web") {
        exclude(module = "spring-boot-starter-json")
        exclude(group = "org.hibernate.validator", module = "hibernate-validator")
        exclude(module = "spring-boot-starter-actuator")
    }

    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("io.github.microutils:kotlin-logging:1.12.0")
    implementation("tel.schich:javacan:2.3.0")
    implementation("org.ini4j:ini4j:0.5.4")

    implementation("com.fazecast:jSerialComm:[2.0.0,3.0.0)")

    annotationProcessor("org.springframework:spring-context-indexer:2.4.2")

    developmentOnly("org.springframework.boot:spring-boot-devtools")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "11"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
