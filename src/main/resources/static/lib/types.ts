import * as PIXI from "pixi.js"

export interface IndicatorContainer {
    left?: boolean;
    right?: boolean;
    lowBeam?: boolean;
    highBeam?: boolean;
    mil?: boolean;
    oil?: boolean;
    battery?: boolean;
    fuel?: boolean;
    coolant?: boolean;
}

export interface SpriteContainer {
    coolant?: PIXI.Sprite;
    resetTrip?: PIXI.Sprite;
    fuel?: PIXI.Sprite;
    battery?: PIXI.Sprite;
    oil?: PIXI.Sprite;
    mil?: PIXI.Sprite;
    highBeam?: PIXI.Sprite;
    lowBeam?: PIXI.Sprite;
    rightIndicator?: PIXI.Sprite;
    leftIndicator?: PIXI.Sprite;
    centerLogo?: PIXI.Sprite;
    oilNeedle?: PIXI.Sprite;
    coolantNeedle?: PIXI.Sprite;
    mphNeedle?: PIXI.Sprite;
    rpmNeedle?: PIXI.Sprite;
    rightGaugeFg?: PIXI.Sprite;
    rightFuelHilite?: PIXI.Sprite;
    rightFuelHilite2?: PIXI.Sprite;
    rightGaugeBg?: PIXI.Sprite;
    rightGaugeBg2?: PIXI.Sprite;
    leftBoostLaggingMax?: PIXI.Sprite;
    leftBoostHilite?: PIXI.Sprite;
    leftGaugeBg?: PIXI.Sprite;
    leftGaugeFg?: PIXI.Sprite;
    backupCamera?: PIXI.Sprite;
    centerLines?: PIXI.Sprite;
}

export interface TextContainer {
    batteryVoltage?: PIXI.Text;
    clock?: PIXI.Text;
    temperature?: PIXI.Text;
    odometer?: PIXI.Text;
    tripOdometer?: PIXI.Text;
    boostLeft?: PIXI.BitmapText;
    mph?: PIXI.BitmapText;
    rpm?: PIXI.BitmapText;
}

export interface GraphicsContainer {
    rightGaugeFuelBlackout?: PIXI.Graphics;
    leftGaugeBoostBlackout?: PIXI.Graphics;
}

interface StatusMessageBody {
    mph: number;            // Serial
    rpm: number;               // OBD2
    boost: number;          // OBD2
    coolant: number;           // OBD2
    fuel: number;           // Serial
    mil: boolean;           // OBD2
    oilPressure: number;    // OBD2
    lowBeam: boolean;       // Serial
    highBeam: boolean;      // Serial
    left: boolean;          // Serial
    reverse: boolean;       // Serial
    right: boolean;         // Serial
    voltage: number;        // OBD2
    odometer: number;       // Serial + Config
    temperature: number;    // Serial + Config
    tripOdometer: number;    // Serial + Config
}

export interface StatusMessage {
    body: StatusMessageBody
}

export interface LogMessage {
    body?: string[]
}

export interface VehicleParameters {
    rpm: number;
    mph: number;
    coolant: number;
    fuel: number;
    boost: number;
    voltage: number;
    odometer: number;
    tripOdometer: number;
    boostLaggingMax?: number;
    reverse: boolean;
    temperature: number;
    oilPressure: number;
}