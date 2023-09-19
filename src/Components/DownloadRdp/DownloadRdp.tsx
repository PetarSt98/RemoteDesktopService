import { makeStyles } from "@material-ui/core";
import { customizeRdpFile } from "./rdp-template";
import "./DownloadRdp.scss";
import { useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

interface DownloadRdpProps {
  hidden?: boolean;
  disable?: boolean;
  computerName: string;
  className?: string;  // New prop for custom class styling
}

const useStyles = makeStyles({
  button: {
    minWidth: "210px"
  }
});

export const DownloadRdp = ({ computerName, className }: DownloadRdpProps) => {
  const refContainer = useRef<HTMLAnchorElement>(null);

  const downloadRdp = () => {
    if (!computerName.trim()) {
      return;
    }
    const file = new Blob([customizeRdpFile(computerName)], {
      type: "text/plain"
    });
    if (refContainer.current !== null) {
      refContainer.current.href = URL.createObjectURL(file);
      refContainer.current.download = `${computerName}.rdp`;
      refContainer.current.click();
    }
  };

  const shouldDisable = computerName.trim().length === 0;
  const classes = useStyles();
  return (
    <>
      <button 
        className={className ? className : `btn btn-outline-success btn-sm ${shouldDisable ? 'disabled' : ''}`}
        onClick={downloadRdp}
        title="Download RDP file"
      >
        <FontAwesomeIcon icon={faDownload} />

      </button>
      <a style={{ display: "none" }} ref={refContainer} href="/"></a>
    </>
  );
};
