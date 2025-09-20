import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks";
import {
  templateProvider,
  InputSchemaRender,
  mapperBackendReq,
  serviceProvider,
} from "@/utils";
import LazySection from "./LazySection";
import FieldSkeleton from "../skeleton/FieldSkeleton";
import { ProductMasterService, ProductService } from "@/entities/service";
import { Button } from "@/component/ui";

const FieldEditor = ({
  data,
  onExpand,
  onClose,
  onAdd,
  selectedOption,
  contextData,
  isAdding = false,
}) => {
  const { user } = useAuth();
  const userRole = user?.role || "CLIENT";
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [template, setTemplate] = useState({});
  const [service, setService] = useState(null);
  const [isdeleting, setDeleting] = useState(false);

  const [refData, setRefData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const mapperRef = useRef();

  const [editableData, setEditableData] = useState(() => ({ ...data }));

  useEffect(() => {
    const mode = isAdding ? "create" : "update";
    const model = selectedOption === "info" ? "carwash" : selectedOption;
    const template = templateProvider[mode][model][userRole];
    for (const [key, fieldConfig] of Object.entries(template)) {
      if (fieldConfig.fn) {
        const refFunction = fieldConfig.fn;

        switch (refFunction) {
          case "ProductMasterService":
            ProductMasterService.retrieveAll().then((res) => {
              template[key].options = res;
              setRefData(res);
            });
            break;
          case "ProductService":
            const res = contextData.products.map((product) => ({
              id: product.id,
              name: product.name,
            }));
            template[key].options = res;
            setRefData(res);
        }
      }
    }
    const service = serviceProvider[model];
    mapperRef.current = mapperBackendReq[mode][model];
    setTemplate(template);
    setService(service);
    setLoading(false);
  }, [isAdding, selectedOption, user, contextData]);

  useEffect(() => {
    setEditableData({ ...data });
  }, [data]);

  const handleInputChange = (key, value) => {
    setEditableData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const mappedData = mapperRef.current
        ? mapperRef.current(editableData, refData)
        : editableData;

      const mappedID = mappedData.id;
      delete mappedData.id; //delete because pass a dto with a id will cause some strange behavior

      const response = await service[isAdding ? "create" : "update"](
        mappedID,
        mappedData
      );
    } catch (error) {
      console.error("Error:", error);
      setSubmitError(error);
    } finally {
      setIsSubmitting(false);
      onClose(true);
    }
  };

  const handleDelete = () => {
    if (selectedOption === "info") return;
    setDeleting(true);
    console.log(editableData);

    serviceProvider[selectedOption]
      .delete(editableData.id)
      .then((res) => console.log("res", res))
      .catch((err) => console.log("err", err));
    setDeleting(false);
    onClose(true);
  };
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Top buttons */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
        {!isEditing && !isAdding ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            className="inline-flex items-center px-4 py-2"
          >
            <i className="fas fa-pencil-alt mr-2 text-xs"></i> Edit
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
              isSubmitting
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[#cc0000] text-white hover:bg-[#a30000]"
            }`}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2 text-xs"></i>{" "}
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2 text-xs"></i> Submit
              </>
            )}
          </Button>
        )}
        {selectedOption !== "info" ? (
          <button
            onClick={handleDelete}
            disabled={isdeleting}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
              isdeleting
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[#cc0000] text-white hover:bg-[#a30000]"
            }`}
          >
            {isdeleting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2 text-xs"></i>{" "}
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2 text-xs"></i> Delete
              </>
            )}
          </button>
        ) : null}
      </div>

      {/* Fields */}
      <LazySection isLoading={isLoading} skeleton={<FieldSkeleton />}>
        <ul className="space-y-5">
          {Object.entries(template).map(([key, templateConfig]) => {
            const value = editableData[key];
            const editable = templateConfig.editable && (isAdding || isEditing);
            const config = {
              ...templateConfig,
              editable,
              key,
            };
            return (
              <li
                key={key}
                className="pb-4 border-b border-gray-100 last:border-b-0"
              >
                <span className="block text-sm font-semibold text-gray-600 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <div className="relative group">
                  {Array.isArray(value) ? (
                    <div className="mt-1 text-sm text-gray-700">
                      <ul className="ml-5 list-disc space-y-1">
                        {value.slice(0, 2).map((item, index) => (
                          <li key={index} className="text-xs">
                            {typeof item === "object" && item !== null
                              ? `${Object.keys(item)[0]}: ${
                                  item[Object.keys(item)[0]]
                                }, ${Object.keys(item)[1]}: ${
                                  item[Object.keys(item)[1]]
                                }`
                              : JSON.stringify(item)}
                          </li>
                        ))}
                        {value.length > 2 && (
                          <li className="text-xs italic text-gray-500">
                            ... ({value.length - 2} more)
                          </li>
                        )}
                      </ul>
                      <button
                        onClick={() => onExpand(value)}
                        className="absolute top-[-28px] right-0 inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                      >
                        <i className="fas fa-expand-arrows-alt mr-1"></i> Expand
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <InputSchemaRender
                        value={value}
                        config={config}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </LazySection>
    </div>
  );
};

export default FieldEditor;
