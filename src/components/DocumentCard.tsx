import React, { useState } from "react";
import { format, parseISO, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Document } from "@/types";
import { Checkbox } from "./ui/checkbox";
import {
  Calendar as CalendarIcon,
  ExternalLink,
  FileCheck,
  FilePlus,
  Info,
  Plus,
  Trash,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { getDocuments, isDocumentExpired } from "@/utils/storage";

interface DocumentCardProps {
  document: Document;
  onUpdate: (id: string, document: Partial<Document>) => void;
  activeTab?: string;
}

// Helper to get readable validity period
const getReadableValidityPeriod = (validityPeriod?: string): string => {
  switch (validityPeriod) {
    case "30days":
      return "30 dias";
    case "90days":
      return "90 dias";
    case "3months":
      return "3 meses";
    case "1year":
      return "1 ano";
    case "5years":
      return "5 anos";
    case "10years":
      return "10 anos";
    case "none":
    default:
      return "Sem validade";
  }
};

// Brazilian states for council certifications
const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// Helper function to format date for input
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = parseISO(dateString);
    return format(date, "yyyy-MM-dd");
  } catch (error) {
    return "";
  }
};

// Helper function to parse date from input
const parseDateFromInput = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString + "T00:00:00"); // Mantém o fuso horário local
    return date.toISOString().split("T")[0]; // Retorna no formato correto
  } catch (error) {
    return "";
  }
};

export function DocumentCard({
  document,
  onUpdate,
  activeTab,
}: DocumentCardProps) {
  const [userAge, setUserAge] = useState<number | undefined>(document.userAge);

  const handleIssueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      onUpdate(document.id, { issueDate: parseDateFromInput(dateValue) });
    } else {
      onUpdate(document.id, { issueDate: undefined });
    }
  };

  const handleStateIssueDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stateCode: string
  ) => {
    const dateValue = e.target.value;
    const currentIssueDates = document.stateIssueDates || {};

    if (dateValue) {
      onUpdate(document.id, {
        stateIssueDates: {
          ...currentIssueDates,
          [stateCode]: parseDateFromInput(dateValue),
        },
      });
    } else {
      const updatedDates = { ...currentIssueDates };
      delete updatedDates[stateCode];
      onUpdate(document.id, { stateIssueDates: updatedDates });
    }
  };

  const handleLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stateCode?: string
  ) => {
    if (stateCode) {
      // For state-specific documents
      const currentLinks = document.stateLinks || {};
      onUpdate(document.id, {
        stateLinks: {
          ...currentLinks,
          [stateCode]: e.target.value,
        },
      });
    } else {
      // For regular documents
      onUpdate(document.id, { driveLink: e.target.value });
    }
  };

  const handleStateToggle = (state: string) => {
    const currentStates = document.states || [];
    const updatedStates = currentStates.includes(state)
      ? currentStates.filter((s) => s !== state)
      : [...currentStates, state];

    onUpdate(document.id, { states: updatedStates });
  };

  const handleVaccineDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const dateValue = e.target.value;
    if (!dateValue) return;

    const doses = [...(document.vaccineDoses || [])];
    doses[index] = parseDateFromInput(dateValue);
    onUpdate(document.id, { vaccineDoses: doses });
  };

  const addVaccineDose = () => {
    const doses = [...(document.vaccineDoses || [])];
    doses.push(new Date().toISOString());
    onUpdate(document.id, { vaccineDoses: doses });
  };

  const removeVaccineDose = (index: number) => {
    const doses = [...(document.vaccineDoses || [])];
    doses.splice(index, 1);
    onUpdate(document.id, { vaccineDoses: doses });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value);
    if (!isNaN(age)) {
      setUserAge(age);
      onUpdate(document.id, { userAge: age });
    }
  };

  const handleHasNotarizedCopy = (checked: boolean) => {
    onUpdate(document.id, { hasNotarizedCopy: checked });
  };

  // Check if the document is expired
  const expired = document.expirationDate && isDocumentExpired(document);

  // Get required doses for vaccines based on rules
  const getRequiredDoses = () => {
    if (document.name === "Vacina Hepatite B") {
      return 3;
    } else if (document.name === "Vacina Tríplice Viral") {
      if (userAge && userAge >= 20 && userAge <= 29) {
        return 2;
      } else if (userAge && userAge >= 30 && userAge <= 59) {
        return 1;
      }
      return 0;
    } else if (document.name === "Vacina DT") {
      return 3;
    }
    return 0;
  };

  // Validate vaccine schedule
  const isVaccineScheduleValid = () => {
    const doses = document.vaccineDoses || [];
    if (doses.length === 0) return false;

    if (document.name === "Vacina Hepatite B" && doses.length === 3) {
      const firstDose = parseISO(doses[0]);
      const secondDose = parseISO(doses[1]);
      const thirdDose = parseISO(doses[2]);

      // Second dose should be at least 1 month after first dose
      const secondDoseValid =
        secondDose.getTime() >=
        new Date(
          firstDose.getFullYear(),
          firstDose.getMonth() + 1,
          firstDose.getDate()
        ).getTime();

      // Third dose should be at least 6 months after first dose
      const thirdDoseValid =
        thirdDose.getTime() >=
        new Date(
          firstDose.getFullYear(),
          firstDose.getMonth() + 6,
          firstDose.getDate()
        ).getTime();

      return secondDoseValid && thirdDoseValid;
    } else if (document.name === "Vacina DT" && doses.length === 3) {
      const firstDose = parseISO(doses[0]);
      const secondDose = parseISO(doses[1]);
      const thirdDose = parseISO(doses[2]);

      // 60 days between doses
      const secondDoseValid =
        secondDose.getTime() >=
        new Date(
          firstDose.getFullYear(),
          firstDose.getMonth(),
          firstDose.getDate() + 60
        ).getTime();
      const thirdDoseValid =
        thirdDose.getTime() >=
        new Date(
          secondDose.getFullYear(),
          secondDose.getMonth(),
          secondDose.getDate() + 60
        ).getTime();

      return secondDoseValid && thirdDoseValid;
    } else if (document.name === "Vacina Tríplice Viral") {
      const requiredDoses = getRequiredDoses();
      return doses.length >= requiredDoses;
    }

    return false;
  };

  const isVaccine = [
    "Vacina Hepatite B",
    "Vacina Tríplice Viral",
    "Vacina DT",
  ].includes(document.name);
  const requiredDoses = getRequiredDoses();
  const isStateDocument =
    document.name === "Certidão Negativa Ético-Disciplinar do Conselho" ||
    document.name === "Comprovante de Quitação da Anuidade do Conselho";
  const requiresNotarizedCopy = [
    "Declaração de Não Penalidades",
    "Declaração de Não Acumulação de Cargos",
    "Declaração de Bens",
  ].includes(document.name);

  // New function to check if document needs booster
  const needsBooster = () => {
    if (
      document.name === "Vacina DT" &&
      document.vaccineDoses &&
      document.vaccineDoses.length >= 3
    ) {
      const lastDose = parseISO(
        document.vaccineDoses[document.vaccineDoses.length - 1]
      );
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      return lastDose < tenYearsAgo;
    }
    return false;
  };

  // New logic to check if the document is complete
  const isDocumentComplete = () => {
    if (!document.hasDocument) return false;

    // Check for Google Drive link requirement
    if (!document.driveLink && !isStateDocument && !isVaccine) return false;

    // For state documents, check if all selected states have links and issue dates
    if (isStateDocument) {
      if (!document.states || document.states.length === 0) return false;
      return document.states.every(
        (state) =>
          document.stateLinks &&
          document.stateLinks[state] &&
          document.stateLinks[state].trim() !== "" &&
          document.stateIssueDates &&
          document.stateIssueDates[state]
      );
    }

    // For vaccines, check if schedule is valid
    if (isVaccine) {
      return isVaccineScheduleValid();
    }

    // For documents requiring notarized copy
    if (requiresNotarizedCopy && !document.hasNotarizedCopy) {
      return false;
    }

    return !expired;
  };

  // Check if document has a vaccine problem (incomplete or invalid schedule)
  const hasVaccineProblem = () => {
    if (!isVaccine) return false;
    if (!document.hasDocument) return false;

    const doses = document.vaccineDoses || [];

    // Missing doses
    if (doses.length < requiredDoses) return true;

    // Invalid schedule
    if (!isVaccineScheduleValid()) return true;

    return false;
  };

  // Determine document status for filtering
  const documentStatus = expired
    ? "expired"
    : !document.hasDocument
    ? "pending"
    : hasVaccineProblem()
    ? "vaccine"
    : isDocumentComplete()
    ? "completed"
    : "pending";

  // Only show documents that match the active tab filter
  if (activeTab && activeTab !== "all" && activeTab !== documentStatus) {
    return null;
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md animate-fade-in",
        expired
          ? "border-red-300 bg-red-50"
          : hasVaccineProblem()
          ? "border-orange-300 bg-orange-50"
          : isDocumentComplete()
          ? "border-green-300 bg-green-50"
          : document.hasDocument
          ? "border-yellow-300 bg-yellow-50"
          : ""
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>{document.name}</span>
            {document.validityPeriod && document.validityPeriod !== "none" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">
                      {getReadableValidityPeriod(document.validityPeriod)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Validade:{" "}
                      {getReadableValidityPeriod(document.validityPeriod)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {isDocumentComplete() && (
            <FileCheck className="h-5 w-5 text-green-600" />
          )}
          {hasVaccineProblem() && (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          )}
          {document.hasDocument &&
            !isDocumentComplete() &&
            !hasVaccineProblem() && (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          {!document.hasDocument && (
            <FilePlus className="h-5 w-5 text-gray-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Checkbox section for document status */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`has-document-${document.id}`}
              checked={document.hasDocument}
              onCheckedChange={(checked) => {
                onUpdate(document.id, { hasDocument: !!checked });
              }}
            />
            <Label htmlFor={`has-document-${document.id}`}>
              Possuo o documento
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`has-physical-${document.id}`}
              checked={document.hasPhysicalCopy}
              onCheckedChange={(checked) => {
                onUpdate(document.id, { hasPhysicalCopy: !!checked });

                // 🔄 Atualiza a lista global para refletir a mudança sem recarregar a página
                setTimeout(() => {
                  const updatedDocs = getDocuments(); // Obtém a lista atualizada
                  onUpdate(
                    document.id,
                    updatedDocs.find((doc) => doc.id === document.id) || {}
                  );
                }, 100); // Pequeno delay para garantir a atualização
              }}
            />
            <Label htmlFor={`has-physical-${document.id}`}>
              Tenho cópia física
            </Label>
          </div>

          {requiresNotarizedCopy && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`has-notarized-${document.id}`}
                checked={!!document.hasNotarizedCopy}
                onCheckedChange={(checked) => {
                  handleHasNotarizedCopy(!!checked);
                }}
              />
              <Label htmlFor={`has-notarized-${document.id}`}>
                Possui firma reconhecida
              </Label>
            </div>
          )}
        </div>

        {/* Age input for Triple Viral Vaccine */}
        {document.name === "Vacina Tríplice Viral" && (
          <div className="space-y-2">
            <Label htmlFor={`age-${document.id}`}>Sua idade</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`age-${document.id}`}
                type="number"
                min="0"
                max="100"
                value={userAge || ""}
                onChange={handleAgeChange}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                {userAge && userAge >= 20 && userAge <= 29
                  ? "Necessário 2 doses"
                  : userAge && userAge >= 30 && userAge <= 59
                  ? "Necessário 1 dose"
                  : "Informe sua idade"}
              </span>
            </div>
          </div>
        )}

        {/* Vaccine doses */}
        {isVaccine && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Datas das doses
                {requiredDoses > 0 && (
                  <span className="text-sm text-muted-foreground ml-1">
                    ({(document.vaccineDoses || []).length}/{requiredDoses})
                  </span>
                )}
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={addVaccineDose}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar Dose
              </Button>
            </div>

            {document.name === "Vacina Hepatite B" && (
              <p className="text-xs text-muted-foreground">
                Esquema: 3 doses - 2ª dose 1 mês após a 1ª, 3ª dose 6 meses após
                a 1ª
              </p>
            )}

            {document.name === "Vacina DT" && (
              <p className="text-xs text-muted-foreground">
                Esquema: 3 doses - intervalo mínimo de 60 dias entre cada dose,
                reforço a cada 10 anos
              </p>
            )}

            <div className="space-y-2">
              {(document.vaccineDoses || []).map((dose, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={format(parseISO(dose), "dd/MM/yyyy")}
                      onChange={(e) => {
                        const dateValue = e.target.value;

                        // Parse the date in DD/MM/YYYY format
                        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
                          const [day, month, year] = dateValue
                            .split("/")
                            .map(Number);

                          // Check if it's a valid date
                          const newDate = new Date(year, month - 1, day);
                          const isValidDay =
                            day > 0 &&
                            day <= new Date(year, month, 0).getDate();
                          const isValidMonth = month > 0 && month <= 12;

                          if (
                            isValidDay &&
                            isValidMonth &&
                            !isNaN(newDate.getTime())
                          ) {
                            handleVaccineDateChange(
                              {
                                target: {
                                  value: newDate.toISOString().split("T")[0],
                                },
                              } as React.ChangeEvent<HTMLInputElement>,
                              index
                            );
                          }
                        }
                      }}
                      placeholder="DD/MM/YYYY"
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => removeVaccineDose(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {needsBooster() && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
              >
                Necessita dose de reforço (último reforço há mais de 10 anos)
              </Badge>
            )}

            {isVaccine &&
              (document.vaccineDoses || []).length === requiredDoses &&
              isVaccineScheduleValid() &&
              !needsBooster() && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  Esquema vacinal completo
                </Badge>
              )}

            {isVaccine &&
              (document.vaccineDoses || []).length === requiredDoses &&
              !isVaccineScheduleValid() && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                >
                  Intervalos incorretos
                </Badge>
              )}

            {isVaccine &&
              (document.vaccineDoses || []).length < requiredDoses && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-800 hover:bg-red-100 border-red-200"
                >
                  Esquema vacinal incompleto
                </Badge>
              )}
          </div>
        )}

        {document.validityPeriod &&
          document.validityPeriod !== "none" &&
          !isVaccine &&
          !isStateDocument && (
            <div className="space-y-2">
              <Label htmlFor={`issue-date-${document.id}`}>
                Data de emissão{" "}
                {document.validityPeriod
                  ? `(Validade: ${getReadableValidityPeriod(
                      document.validityPeriod
                    )})`
                  : ""}
              </Label>
              <Input
                id={`issue-date-${document.id}`}
                type="date"
                value={
                  document.issueDate
                    ? format(parseISO(document.issueDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    const adjustedDate = new Date(dateValue + "T00:00:00"); // Mantém o fuso horário local
                    onUpdate(document.id, {
                      issueDate: adjustedDate.toISOString().split("T")[0],
                    });
                  } else {
                    onUpdate(document.id, { issueDate: undefined });
                  }
                }}
                className="w-full"
              />
            </div>
          )}

        {/* State selection for documents with state requirements */}
        {isStateDocument && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Selecione os estados onde possui registro:</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Selecione todos os estados onde você possui registro
                      profissional.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
              {brazilianStates.map((state) => (
                <Badge
                  key={state}
                  variant={
                    document.states?.includes(state) ? "default" : "outline"
                  }
                  className={cn(
                    "cursor-pointer hover:opacity-80 transition-opacity",
                    document.states?.includes(state) ? "bg-primary" : ""
                  )}
                  onClick={() => handleStateToggle(state)}
                >
                  {state}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Document links */}
        {isStateDocument ? (
          // For documents that require state-specific links
          <div className="space-y-4">
            <Label>Informações para cada estado selecionado:</Label>
            {(document.states || []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Selecione pelo menos um estado acima
              </p>
            )}
            {(document.states || []).map((state) => (
              <div
                key={state}
                className="space-y-2 border-b pb-4 last:border-b-0"
              >
                <div className="font-medium">{state}</div>

                <div className="space-y-2">
                  <Label htmlFor={`link-${document.id}-${state}`}>
                    Link do documento
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`link-${document.id}-${state}`}
                      type="url"
                      placeholder={`Link para ${state}`}
                      value={
                        (document.stateLinks && document.stateLinks[state]) ||
                        ""
                      }
                      onChange={(e) => handleLinkChange(e, state)}
                      className="flex-1"
                    />
                    {document.stateLinks && document.stateLinks[state] && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          window.open(document.stateLinks?.[state], "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Label htmlFor={`issue-date-${document.id}-${state}`}>
                    Data de emissão
                  </Label>
                  <Input
                    id={`issue-date-${document.id}-${state}`}
                    type="text"
                    value={
                      document.stateIssueDates?.[state]
                        ? format(
                            parseISO(document.stateIssueDates[state]),
                            "dd/MM/yyyy"
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const dateValue = e.target.value;

                      // Parse the date in DD/MM/YYYY format
                      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
                        const [day, month, year] = dateValue
                          .split("/")
                          .map(Number);

                        // Check if it's a valid date
                        const newDate = new Date(year, month - 1, day);
                        const isValidDay =
                          day > 0 && day <= new Date(year, month, 0).getDate();
                        const isValidMonth = month > 0 && month <= 12;

                        if (
                          isValidDay &&
                          isValidMonth &&
                          !isNaN(newDate.getTime())
                        ) {
                          handleStateIssueDateChange(
                            {
                              target: {
                                value: newDate.toISOString().split("T")[0],
                              },
                            } as React.ChangeEvent<HTMLInputElement>,
                            state
                          );
                        }
                      }
                    }}
                    placeholder="DD/MM/YYYY"
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // For regular documents and vaccines
          <div className="space-y-2">
            <Label htmlFor={`link-${document.id}`}>Link no Google Drive</Label>
            <div className="flex items-center space-x-2">
              <Input
                id={`link-${document.id}`}
                type="url"
                placeholder="https://drive.google.com/..."
                value={document.driveLink || ""}
                onChange={(e) => handleLinkChange(e)}
                className="flex-1"
              />
              {document.driveLink && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(document.driveLink, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        {document.expirationDate && (
          <div
            className={cn(
              "text-sm",
              expired ? "text-red-500" : "text-green-600"
            )}
          >
            {expired
              ? `Expirou em ${format(
                  parseISO(document.expirationDate),
                  "dd/MM/yyyy"
                )}`
              : `Válido até ${format(
                  parseISO(document.expirationDate),
                  "dd/MM/yyyy"
                )}`}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
