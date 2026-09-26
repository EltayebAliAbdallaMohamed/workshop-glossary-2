const presentationSelect =
  document.getElementById("presentationSelect");

const slidesContainer =
  document.getElementById("slidesContainer");

const notesContainer =
  document.getElementById("notesContainer");

const speakSelectionButton =
  document.getElementById("speakSelection");

const slideNumberInput =
  document.getElementById("slideNumber");

const goToSlideButton =
  document.getElementById("goToSlide");


// ============================================================
// 2. VARIABLES
// ============================================================

let currentSlides = [];

let revealInitialized = false;


// ============================================================
// 3. LOAD PRESENTATION LIST
// ============================================================

async function loadPresentationList() {

  try {

    const response =
      await fetch("presentations.json");

    if (!response.ok) {

      throw new Error(
        "Could not load presentations.json"
      );

    }

    const data =
      await response.json();


    presentationSelect.innerHTML =
      '<option value="">-- Choose a presentation --</option>';


    // ----------------------------------------------------------
    // Check presentation list
    // ----------------------------------------------------------

    if (
      !data.presentations ||
      !Array.isArray(data.presentations)
    ) {

      throw new Error(
        "presentations.json must contain a 'presentations' array."
      );

    }


    // ----------------------------------------------------------
    // Create dropdown options
    // ----------------------------------------------------------

    data.presentations.forEach(
      presentation => {

        if (!presentation.file) {
          return;
        }


        const option =
          document.createElement("option");


        option.value =
          presentation.file;


        option.textContent =
          presentation.title ||
          presentation.file;


        presentationSelect.appendChild(
          option
        );

      }
    );

  }


  catch (error) {

    console.error(error);


    presentationSelect.innerHTML =
      '<option value="">Error loading presentations</option>';

  }

}


// ============================================================
// 4. LOAD ONE PRESENTATION
// ============================================================

async function loadPresentation(fileName) {

  if (!fileName) {
    return;
  }


  try {

    const response =
      await fetch(fileName);


    if (!response.ok) {

      throw new Error(
        "Could not load " + fileName
      );

    }


    const data =
      await response.json();


    // ----------------------------------------------------------
    // Check JSON structure
    // ----------------------------------------------------------

    if (
      !data.topics ||
      !Array.isArray(data.topics) ||
      data.topics.length === 0
    ) {

      throw new Error(
        "The JSON file must contain a 'topics' array."
      );

    }


    // ----------------------------------------------------------
    // Use the first topic
    // ----------------------------------------------------------

    const topic =
      data.topics[0];


    if (
      !topic.slides ||
      !Array.isArray(topic.slides)
    ) {

      throw new Error(
        "The topic must contain a 'slides' array."
      );

    }


    currentSlides =
      topic.slides;


    // ----------------------------------------------------------
    // Create the new slides
    // ----------------------------------------------------------

    createSlides(
      currentSlides
    );


    // ----------------------------------------------------------
    // Reveal.js
    // ----------------------------------------------------------

    if (!revealInitialized) {

      await initializeReveal();

    }


    else {

      // Tell Reveal.js that the slide structure changed

      Reveal.sync();


      // Start the new presentation at slide 1

      Reveal.slide(
        0,
        0,
        0
      );


      updateNotes();

    }

  }


  catch (error) {

    console.error(error);


    slidesContainer.innerHTML = `
      <section>
        <h2>Unable to load presentation</h2>
        <p>${error.message}</p>
      </section>
    `;


    if (revealInitialized) {

      Reveal.sync();

    }

  }

}


// ============================================================
// 5. CREATE REVEAL.JS SLIDES
// ============================================================

function createSlides(slides) {

  // ----------------------------------------------------------
  // Completely remove previous slides
  // ----------------------------------------------------------

  slidesContainer.innerHTML = "";


  // ----------------------------------------------------------
  // Create each slide
  // ----------------------------------------------------------

  slides.forEach(
    (slide, index) => {

      const section =
        document.createElement("section");


      // ========================================================
      // SLIDE HEADING
      // ========================================================

      if (slide.heading) {

        const heading =
          document.createElement("h2");


        heading.textContent =
          slide.heading;


        section.appendChild(
          heading
        );

      }


      // ========================================================
      // GET SLIDE LAYOUT
      // ========================================================

      const layout =
        slide.layout || "standard";


      // ========================================================
      // CREATE CONTENT BLOCK
      // ========================================================

      let contentBlock = null;


      if (slide.content) {

        contentBlock =
          document.createElement("div");


        contentBlock.className =
          "slide-content";


        // ------------------------------------------------------
        // Split content at line breaks
        // ------------------------------------------------------

        const lines =
          String(
            slide.content
          ).split("\n");


        lines.forEach(
          line => {

            const paragraph =
              document.createElement("p");


            paragraph.textContent =
              line;


            contentBlock.appendChild(
              paragraph
            );

          }
        );

      }


      // ========================================================
      // CREATE IMAGE
      // ========================================================

      let imageBlock = null;


      if (
        slide.image &&
        String(slide.image).trim() !== ""
      ) {

        imageBlock =
          document.createElement("img");


        imageBlock.src =
          slide.image;


        imageBlock.alt =
          slide.imageAlt ||
          slide.heading ||
          "Presentation image";


        imageBlock.className =
          "slide-image";

      }


      // ========================================================
      // STANDARD LAYOUT
      // ========================================================

      if (
        layout === "standard"
      ) {

        if (contentBlock) {

          section.appendChild(
            contentBlock
          );

        }


        if (imageBlock) {

          section.appendChild(
            imageBlock
          );

        }

      }


      // ========================================================
      // IMAGE LEFT
      // ========================================================

      else if (
        layout === "image-left"
      ) {

        const wrapper =
          document.createElement("div");


        wrapper.className =
          "two-column";


        const leftColumn =
          document.createElement("div");


        leftColumn.className =
          "column-image";


        const rightColumn =
          document.createElement("div");


        rightColumn.className =
          "column-text";


        if (imageBlock) {

          leftColumn.appendChild(
            imageBlock
          );

        }


        if (contentBlock) {

          rightColumn.appendChild(
            contentBlock
          );

        }


        wrapper.appendChild(
          leftColumn
        );


        wrapper.appendChild(
          rightColumn
        );


        section.appendChild(
          wrapper
        );

      }


      // ========================================================
      // IMAGE RIGHT
      // ========================================================

      else if (
        layout === "image-right"
      ) {

        const wrapper =
          document.createElement("div");


        wrapper.className =
          "two-column";


        const leftColumn =
          document.createElement("div");


        leftColumn.className =
          "column-text";


        const rightColumn =
          document.createElement("div");


        rightColumn.className =
          "column-image";


        if (contentBlock) {

          leftColumn.appendChild(
            contentBlock
          );

        }


        if (imageBlock) {

          rightColumn.appendChild(
            imageBlock
          );

        }


        wrapper.appendChild(
          leftColumn
        );


        wrapper.appendChild(
          rightColumn
        );


        section.appendChild(
          wrapper
        );

      }


      // ========================================================
      // UNKNOWN LAYOUT
      // ========================================================

      else {

        // If an unknown layout is entered,
        // use the standard layout.

        if (contentBlock) {

          section.appendChild(
            contentBlock
          );

        }


        if (imageBlock) {

          section.appendChild(
            imageBlock
          );

        }

      }


      // ========================================================
      // ARABIC TEXT
      // ========================================================

      if (slide.arabic) {

        const arabic =
          document.createElement("div");


        arabic.className =
          "slide-arabic";


        arabic.setAttribute(
          "dir",
          "rtl"
        );


        arabic.textContent =
          slide.arabic;


        section.appendChild(
          arabic
        );

      }


      // ========================================================
      // AUDIO
      // ========================================================

      if (
        slide.audio &&
        String(slide.audio).trim() !== ""
      ) {

        const audio =
          document.createElement("audio");


        audio.controls =
          true;


        audio.src =
          slide.audio;


        audio.preload =
          "metadata";


        section.appendChild(
          audio
        );

      }


      // ========================================================
      // VIDEO
      // ========================================================

      if (
        slide.video &&
        String(slide.video).trim() !== ""
      ) {

        const video =
          document.createElement("video");


        video.controls =
          true;


        video.src =
          slide.video;


        video.preload =
          "metadata";


        video.className =
          "slide-video";


        section.appendChild(
          video
        );

      }


      // ========================================================
      // QUESTION
      // ========================================================

      if (slide.question) {

        const question =
          document.createElement("div");


        question.className =
          "slide-question";


        question.textContent =
          slide.question;


        section.appendChild(
          question
        );

      }


      // ========================================================
      // ANSWER
      // ========================================================

      if (slide.answer) {

        const answer =
          document.createElement("div");


        answer.className =
          "slide-answer";


        answer.textContent =
          slide.answer;


        section.appendChild(
          answer
        );

      }


      // ========================================================
      // PRESENTER NOTES
      // ========================================================

      section.dataset.notes =
        slide.notes || "";


      // Store slide number

      section.dataset.slideNumber =
        index + 1;


      // Store layout

      section.dataset.layout =
        layout;


      // ========================================================
      // ADD SLIDE
      // ========================================================

      slidesContainer.appendChild(
        section
      );

    }
  );

}


// ============================================================
// 6. INITIALIZE REVEAL.JS
// ============================================================

async function initializeReveal() {

  await Reveal.initialize({

    // ----------------------------------------------------------
    // Slide number
    // Example: 3 / 15
    // ----------------------------------------------------------

    slideNumber: "c/t",


    // ----------------------------------------------------------
    // Navigation
    // ----------------------------------------------------------

    keyboard: true,

    controls: true,

    progress: true,

    touch: true,

    overview: true,


    // ----------------------------------------------------------
    // Presentation position
    // ----------------------------------------------------------

    center: true,


    // ----------------------------------------------------------
    // Transitions
    // ----------------------------------------------------------

    transition: "slide",

    backgroundTransition: "fade",


    // ----------------------------------------------------------
    // Presentation size
    // ----------------------------------------------------------

    width: 1200,

    height: 700,

    margin: 0.08,


    // ----------------------------------------------------------
    // Accessibility
    // ----------------------------------------------------------

    keyboardCondition: "focused"

  });


  revealInitialized =
    true;


  updateNotes();

}


// ============================================================
// 7. PRESENTER NOTES
// ============================================================

function updateNotes() {

  if (
    !notesContainer ||
    !revealInitialized
  ) {

    return;

  }


  const currentSlide =
    Reveal.getCurrentSlide();


  if (!currentSlide) {

    notesContainer.textContent =
      "";

    return;

  }


  const notes =
    currentSlide.dataset.notes ||
    "";


  if (notes.trim() === "") {

    notesContainer.textContent =
      "";

  }


  else {

    notesContainer.textContent =
      "Presenter Notes: " +
      notes;

  }

}


// ============================================================
// 8. TEXT-TO-SPEECH
// ============================================================

function speakText(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    alert(
      "Text-to-speech is not supported by this browser."
    );

    return;

  }


  // Stop any previous speech

  speechSynthesis.cancel();


  const speech =
    new SpeechSynthesisUtterance(
      text
    );


  speech.lang =
    "en-US";


  speech.rate =
    0.8;


  speech.pitch =
    1;


  speech.volume =
    1;


  speechSynthesis.speak(
    speech
  );

}


// ============================================================
// 9. SPEAK CURRENT SLIDE
// ============================================================

function speakCurrentSlide() {

  if (!revealInitialized) {

    return;

  }


  const currentSlide =
    Reveal.getCurrentSlide();


  if (!currentSlide) {

    return;

  }


  let text =
    "";


  // ----------------------------------------------------------
  // Heading
  // ----------------------------------------------------------

  const heading =
    currentSlide.querySelector(
      "h2"
    );


  if (heading) {

    text +=
      heading.textContent +
      ". ";

  }


  // ----------------------------------------------------------
  // Paragraphs
  // ----------------------------------------------------------

  const paragraphs =
    currentSlide.querySelectorAll(
      "p"
    );


  paragraphs.forEach(
    paragraph => {

      text +=
        paragraph.textContent +
        " ";

    }
  );


  // ----------------------------------------------------------
  // Speak
  // ----------------------------------------------------------

  speakText(
    text
  );

}


// ============================================================
// 10. INITIALIZE PAGE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // --------------------------------------------------------
    // Load presentation list
    // --------------------------------------------------------

    loadPresentationList();


    // ========================================================
    // PRESENTATION DROPDOWN
    // ========================================================

    presentationSelect.addEventListener(
      "change",
      () => {

        const selectedFile =
          presentationSelect.value;


        if (selectedFile) {

          loadPresentation(
            selectedFile
          );

        }

      }
    );


    // ========================================================
    // GO TO SLIDE
    // ========================================================

    goToSlideButton.addEventListener(
      "click",
      () => {

        const slideNumber =
          parseInt(
            slideNumberInput.value,
            10
          );


        if (
          !isNaN(slideNumber) &&
          slideNumber >= 1 &&
          slideNumber <= currentSlides.length
        ) {

          Reveal.slide(
            slideNumber - 1
          );


          slideNumberInput.value =
            "";

        }

      }
    );


    // ========================================================
    // ENTER KEY IN SLIDE NUMBER BOX
    // ========================================================

    slideNumberInput.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          goToSlideButton.click();

        }

      }
    );


    // ========================================================
    // SPEAK SELECTION
    // ========================================================

    speakSelectionButton.addEventListener(
      "click",
      () => {

        const selectedText =
          window
            .getSelection()
            .toString()
            .trim();


        if (selectedText) {

          speakText(
            selectedText
          );

        }


        else {

          speakCurrentSlide();

        }

      }
    );


    // ========================================================
    // REVEAL.JS SLIDE CHANGE
    // ========================================================

    Reveal.on(
      "slidechanged",
      () => {

        updateNotes();

      }
    );

  }
);