// Core packages
import Image from "next/image";

// Section structure
import Section from "../../structure/section";
import Container from "../../structure/container";

// Section general blocks
import SectionTitle from "../../blocks/section.title.block";
import SectionGridBg from "../../blocks/section.grid.block";

// Section specific blocks
import BadgesBlock from "../../blocks/about.badges.block";
import CopyBlock from "../../blocks/about.copy.block";

// Section scss
import about from "../../../styles/sections/index/about.module.scss";

/**
 * Section: About
 * An overview of yourself.
 * Highlight your top level attributes and disciplines.
 *
 * @returns {jsx} <About />
 */
export default function About() {
  return (
    <Section classProp={about.section}>
      <Container spacing={["verticalXXXLrg"]}>
        <SectionTitle
          title="About Me"
          preTitle="Synopsis"
          subTitle="With interest in biomedical science and public health to gain a comprehensive understanding of health from both molecular and community perspectives. I want to be able to combine modern scientific research with practical public health strategies."
        />
        <section className={about.content}>
          <div className={about.image}>
            <img src="/img/delph.jpg" alt="Delphina photo" />
            {/* <Image src="/img/family-photo.jpg" width={600} height={800}/> */}
          </div>
          <div className={about.copy}>
            <CopyBlock
              title="Biomedical sciences and public health"
              containerClass={about.container}
              iconClass={about.icon}
              icon={["fat", "ear-listen"]}
              copy="With interest in biomedical science and public health to gain a comprehensive understanding of health from both molecular and community perspectives. I want to be able to combine modern scientific research with practical public health strategies."
            />
            <BadgesBlock
              title="Cardiovascular easearch and planning"
              containerClass={about.container}
              list={methods}
              fullContainer="fullContainer"
              block="methods"
              icon="fingerprint"
              copy="One of my favorite part of life is developing health solutions through both soft and technical skills that are scientifically sound and socially impactful. I am to bridge the gap between laboratory discoveries and real world applications , focusing on creating accessible healthcare interventions that can improve lives globally."
              //invertedColor="invertedColor"
              headerIcon={`${about.icon}`}
            />
          </div>
        </section>
      </Container>
    </Section>
  );
}

const methods = [
  { key: "planet-moon", name: "Biomedical Research", type: "fad" },
  { key: "qrcode", name: "Public Health", type: "fad" },
  { key: "window", name: "Public Policy", type: "fad" },
  { key: "cubes", name: "Data Analysis", type: "far" },
  { key: "layer-plus", name: "Bioinformatics", type: "fad" },
  { key: "solar-system", name: "Computational Techniques", type: "fad" },
];
