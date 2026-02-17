'use client';

import Box from '@/app/components/box/Box';
import Button from '@/app/components/ui/button/Button';
import LoadData from '@/app/components/loading/LoadData';
import { GiReturnArrow } from "react-icons/gi";
import { AiTwotoneDelete } from "react-icons/ai";
import { IoFileTray } from "react-icons/io5";
import { SiFiles } from "react-icons/si";
import { PiDownloadDuotone } from "react-icons/pi";
import { useMenu } from '@/lib/context/MenuContext';
import { deleteImport, getImportById, getImportFileDownload, getImportFileInfo } from '@/lib/data/importsRepository';
import { Import } from '@/lib/types/types';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useModal from '@/app/components/ui/modal/useModal';
import CardDetail, { CardDetailProps } from '@/app/components/card/CardDetail';
import { formatDateToSeconds, getColorImportStatus } from '@/lib/commonFunctions';
import Modal from '@/app/components/ui/modal/Modal';
import WarningPopup from '@/app/components/popup/WarningPopup';

export default function ImportDetailPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const importId = params?.id ?? '';
  const { toastAlert, toastInfo, showLoader, hideLoader, removeImport } = useMenu();
  const { toggle, isOpen } = useModal();
  const [importDetail, setImportDetail] = useState<Import | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const duration = useMemo(() => {
    if (!importDetail) {
      return '-';
    }

    const createdAt = new Date(importDetail.createdAt).getTime();
    const updatedAt = new Date(importDetail.updatedAt).getTime();
    if (Number.isNaN(createdAt) || Number.isNaN(updatedAt)) {
      return '-';
    }

    const diffMs = Math.max(0, updatedAt - createdAt);
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }, [importDetail]);

  const details: CardDetailProps[] = useMemo(() => {
    if (!importDetail) {
      return [];
    }

    return [
      {
        color: '#0c0c0c',
        data: importDetail.type,
        label: t('imports.detail.fields.type')
      },
      {
        color: getColorImportStatus(importDetail.status),
        data: t(`imports.status.${importDetail.status.toLowerCase()}`),
        label: t('imports.detail.fields.status')
      },
      {
        color: '#2063fc',
        data: `${importDetail.progress ?? 0}%`,
        label: t('imports.detail.fields.progress')
      },
      {
        color: '#7C3AED',
        data: duration,
        label: t('imports.detail.fields.duration')
      },
      {
        color: '#BE185D',
        data: formatDateToSeconds(importDetail.createdAt),
        label: t('imports.detail.fields.createdAt')
      },
      {
        color: '#C2410C',
        data: formatDateToSeconds(importDetail.updatedAt),
        label: t('imports.detail.fields.updatedAt')
      }
    ];
  }, [duration, importDetail, t]);

  useEffect(() => {
    if (!importId) {
      setIsLoading(false);
      setFileName(null);
      setFileSize(null);
      return;
    }

    let isMounted = true;

    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const [detail, fileInfo] = await Promise.all([
          getImportById(importId),
          getImportFileInfo(importId),
        ]);
        if (isMounted) {
          setImportDetail(detail);
          setFileName(fileInfo?.fileName ?? null);
          setFileSize(fileInfo?.fileSize ?? null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [importId]);

  const formatFileSize = (bytes: number | null) => {
    if (typeof bytes !== "number" || bytes < 0) {
      return null;
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDownloadImportFile = async () => {
    if (!importDetail) {
      return;
    }

    const file = await getImportFileDownload(importDetail.id);
    if (!file) {
      toastAlert(t("imports.detail.fileUnavailable"));
      return;
    }

    try {
      if (file.url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.fileName || `${importDetail.name}.dat`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.fileName || `${importDetail.name}.dat`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toastAlert(t("imports.detail.downloadError"));
    }
  };

  const handleDeleteImport = async () => {
    if (!importDetail) {
      return;
    }

    showLoader();
    try {
      await deleteImport(importDetail.id);
      removeImport(importDetail.id);
      toastInfo(t("imports.detail.deleteSuccess"));
      toggle();
      router.push('/imports');
    } catch {
      toastAlert(t("imports.detail.deleteError"));
    } finally {
      hideLoader();
    }
  };

  const formattedFileSize = useMemo(() => formatFileSize(fileSize), [fileSize]);


  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Box classname="flex flex-col gap-2">
          <LoadData className="h-7 w-48" />
          <LoadData className="h-4 w-2/3" />
        </Box>
        <Box classname="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <LoadData key={`detail-skeleton-${index}`} className="h-16 w-full" />
          ))}
        </Box>
      </div>
    );
  }

  if (!importDetail) {
    return (
      <Box classname="w-full">
        <h2 className="text-lg font-semibold">{t('imports.detail.empty.title')}</h2>
        <p className="mt-2 text-sm text-textGray">{t('imports.detail.empty.description')}</p>
        <Button
          classname="mt-6 w-fit px-4 py-2 text-sm font-semibold"
          label={t('imports.detail.empty.cta')}
          onClick={() => router.push('/imports')}
        />
      </Box>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className='flex w-fit items-center gap-2 cursor-pointer text-sm sm:text-base' onClick={() => router.push('/imports')}>
          <GiReturnArrow />
          {t('imports.detail.back')}
        </div>
        <div className="flex flex-col gap-3">
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <h1 className="min-w-0 wrap-break-word text-xl font-bold leading-tight sm:text-[22px]">{importDetail.name}</h1>
            <div className='flex items-center gap-4 self-start sm:self-auto'>
              <AiTwotoneDelete className='h-5 w-5 cursor-pointer sm:h-[22px] sm:w-[22px]' onClick={toggle} />
              <PiDownloadDuotone
                className='h-5 w-5 cursor-pointer sm:h-[22px] sm:w-[22px]'
                onClick={() => { void handleDownloadImportFile(); }}
              />
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-textGray sm:text-sm'>
            <span className='break-all'>ID: {importDetail.id}</span>
            {fileName && (
              <div className='flex min-w-0 max-w-full items-center gap-2'>
                <SiFiles color='#6D7B90' />
                <span className='truncate'>{fileName}</span>
              </div>
            )}
            {fileSize !== null && (
              <div className='flex min-w-0 items-center gap-2'>
                <IoFileTray color='#6D7B90' />
                {formattedFileSize && <span>({formattedFileSize})</span>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail, index) =>
            <CardDetail key={`${detail.label}-${index}`} color={detail.color} label={detail.label} data={detail.data} />
          )}
        </div>
      </div>
        <Modal isOpen={isOpen}>
          <WarningPopup toggle={toggle} onSubmit={() => { void handleDeleteImport(); }} />
        </Modal>
    </>
  );
}
