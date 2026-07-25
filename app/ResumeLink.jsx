"use client";

export default function ResumeLink({ href }) {
  function handleClick() {
    const downloadLink = document.createElement("a");
    downloadLink.href = "/api/resume/download";
    downloadLink.download = "Nihal_T_Resume.pdf";
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  return (
    <a className="link" href={href} target="_blank" rel="noreferrer" onClick={handleClick}>
      Resume
    </a>
  );
}
