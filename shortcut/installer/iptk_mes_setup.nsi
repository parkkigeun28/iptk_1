; IPTK MES 바로가기 설치 프로그램
; 빌드: makensis iptk_mes_setup.nsi  ->  IPTK_MES_Setup.exe
Unicode true
!include "MUI2.nsh"

!define APPNAME "IPTK MES"
!define APPURL  "https://hcsmart.github.io/iptk_1/"
!define UNKEY   "Software\Microsoft\Windows\CurrentVersion\Uninstall\IPTK_MES"

Name "${APPNAME}"
OutFile "IPTK_MES_Setup.exe"
InstallDir "$LOCALAPPDATA\IPTK MES"
RequestExecutionLevel user
SetCompressor /SOLID lzma

!define MUI_ICON   "..\iptk_1.ico"
!define MUI_UNICON "..\iptk_1.ico"
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "지금 IPTK MES 열기"
!define MUI_FINISHPAGE_RUN_FUNCTION OpenSite
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Korean"

Function OpenSite
  ExecShell "open" "$INSTDIR\IPTK MES.url"
FunctionEnd

Section "Install"
  SetOutPath "$INSTDIR"
  File "..\iptk_1.ico"
  File "IPTK MES.url"
  WriteUninstaller "$INSTDIR\uninstall.exe"
  CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\IPTK MES.url" "" "$INSTDIR\iptk_1.ico" 0
  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\IPTK MES.url" "" "$INSTDIR\iptk_1.ico" 0
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME} 제거.lnk" "$INSTDIR\uninstall.exe"
  WriteRegStr HKCU "${UNKEY}" "DisplayName" "${APPNAME} 바로가기"
  WriteRegStr HKCU "${UNKEY}" "DisplayIcon" "$INSTDIR\iptk_1.ico"
  WriteRegStr HKCU "${UNKEY}" "Publisher" "IPTK (일평기연)"
  WriteRegStr HKCU "${UNKEY}" "URLInfoAbout" "${APPURL}"
  WriteRegStr HKCU "${UNKEY}" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKCU "${UNKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNKEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\${APPNAME}.lnk"
  RMDir /r "$SMPROGRAMS\${APPNAME}"
  Delete "$INSTDIR\iptk_1.ico"
  Delete "$INSTDIR\IPTK MES.url"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "${UNKEY}"
SectionEnd
