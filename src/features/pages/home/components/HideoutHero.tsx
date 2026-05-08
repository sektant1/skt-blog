"use client";

import { HeroFrame } from "@sektant1/phosphor-ui";
import styles from "../HomePage.module.scss";

const art = String.raw`
███████╗███████╗██╗  ██╗████████╗ █████╗ ███╗   ██╗████████╗
██╔════╝██╔════╝██║ ██╔╝╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝
███████╗█████╗  █████╔╝    ██║   ███████║██╔██╗ ██║   ██║
╚════██║██╔══╝  ██╔═██╗    ██║   ██╔══██║██║╚██╗██║   ██║
███████║███████╗██║  ██╗   ██║   ██║  ██║██║ ╚████║   ██║
╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝

██╗  ██╗██╗██████╗ ███████╗ ██████╗ ██╗   ██╗████████╗
██║  ██║██║██╔══██╗██╔════╝██╔═══██╗██║   ██║╚══██╔══╝
███████║██║██║  ██║█████╗  ██║   ██║██║   ██║   ██║
██╔══██║██║██║  ██║██╔══╝  ██║   ██║██║   ██║   ██║
██║  ██║██║██████╔╝███████╗╚██████╔╝╚██████╔╝   ██║
╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝    ╚═╝
`;

export function HideoutHero() {
  return (
    <div className={`pho-flicker-in ${styles.hero}`}>
      <HeroFrame
        art={art}
        topHud={
          <>
            <HeroFrame.HudLed variant="rec" />
            <HeroFrame.HudLabel>REC</HeroFrame.HudLabel>
            <HeroFrame.HudText>CH 0x53 · local · NORM</HeroFrame.HudText>
            <HeroFrame.HudSpacer />
            <HeroFrame.HudBars value={5} />
            <HeroFrame.HudLabel>5/7</HeroFrame.HudLabel>
          </>
        }
        bottomHud={
          <>
            <HeroFrame.HudLed variant="pwr" />
            <HeroFrame.HudLabel>PWR</HeroFrame.HudLabel>
            <HeroFrame.HudSpacer />
            <HeroFrame.HudTape text="// personal technical archive // graphics notes // project logs //" />
          </>
        }
      />
    </div>
  );
}
