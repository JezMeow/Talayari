import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { inputRef, useEffect, useRef, useState } from "react";

import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";

import TextInput from "@/Components/TextInput";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ContextMenu } from "primereact/contextmenu";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ToggleButton } from "primereact/togglebutton";
import { Toolbar } from "primereact/toolbar";
import { Tooltip } from "primereact/tooltip";
import { classNames } from "primereact/utils";

export default function Research({ auth, research_data, author_list }) {
    const user = usePage().props.auth.user;

    const [createResearch, setCreateResearch] = useState(false);
    const [edit_Research, setEdit_Research] = useState(false);
    const [authorDialog, setAuthorDialog] = useState(false);
    const [addAuthor, setAddAuthor] = useState(false);
    const [authorName, setAuthorName] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState("");

    let emptyResearch = {
        id: "",
        research_title: "",
        research_field: "",
        research_date: "",
        researchers: "",
        authors: "",
        new_authors: "",
        research_adviser: "",
        research_grade: "",
        research_keywords: "",
        research_status: "",
        file_url: "",
    };

    let newAuthorName = {
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix_name: "",
        full_name: "",
    };

    const [newAuthor, setNewAuthor] = useState(newAuthorName);

    const [newListAuthor, setNewListAuthor] = useState([]);

    const updateFullName = () => {
        setNewAuthor({
            ...newAuthor,
            full_name: `${
                newAuthor.first_name !== null
                    ? newAuthor.first_name.trim() !== ""
                        ? newAuthor.first_name
                        : ""
                    : ""
            } ${
                newAuthor.middle_name !== null
                    ? newAuthor.middle_name.trim() !== ""
                        ? `${newAuthor.middle_name.charAt(0)}.`
                        : ""
                    : ""
            } ${
                newAuthor.last_name !== null
                    ? newAuthor.last_name.trim() !== ""
                        ? newAuthor.last_name
                        : ""
                    : ""
            } ${newAuthor.suffix_name ? newAuthor.suffix_name : ""}`,
        });
    };

    const {
        data,
        setData,
        post,
        get,
        patch,
        put,
        delete: destroy,
        errors,
        processing,
        wasSuccessful,
        session,
    } = useForm({
        ...emptyResearch,
    });

    const getAuthorsFullNames = (authorIds) => {
        const authorNames = author_list
            .filter((author) => authorIds?.includes(author.id))
            .map((author) => author.full_name)
            .join(", ");
        return authorNames;
    };

    const getAuthorsIds = (authorNames) => {
        const authorIds = author_list
            .filter((author) => authorNames.includes(author.full_name))
            .map((author) => author.id);
        return authorIds;
    };

    const researchData = research_data.map((research) => ({
        ...research,
        authors: getAuthorsFullNames(
            research.researcher_ids?.split(", ").map(Number)
        ),
    }));

    const [research, setResearch] = useState(emptyResearch);

    const [notInResearchAuthors, setNotInResearchAuthors] = useState(
        author_list.map((author) => author.full_name).join(", ")
    );

    useEffect(() => {
        if (authorDialog) {
            const not_in_list = author_list
                .filter(
                    (author) =>
                        !research.authors.split(", ").includes(author.full_name)
                )
                .map((author) => ({
                    id: author.id,
                    full_name: author.full_name,
                }));
            setNotInResearchAuthors(not_in_list);
        }
    }, [authorDialog, research.authors, author_list]);

    const [researchs, setResearchs] = useState(null);
    const [researchDialog, setResearchDialog] = useState(false);
    const [deleteResearchDialog, setDeleteResearchDialog] = useState(false);
    const [deleteResearchsDialog, setDeleteResearchsDialog] = useState(false);
    const [selectedResearch, setSelectedResearch] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);

    const dt = useRef(null);

    const toast = useRef(null);
    const cm = useRef(null);

    const menuModel = [
        {
            label: "View File",
            icon: <i className="m-1 text-green-500 pi pi-fw pi-file"></i>,
            command: () => {
                if (selectedResearch.file_url) {
                    window.open(selectedResearch.file_url, "_blank");
                } else {
                    Swal.fire({
                        position: "center",
                        icon: "error",
                        title: "Oops...",
                        text: "No file attached!",
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            },
        },
        {
            label: "Edit",
            icon: (
                <i className="m-1 text-green-500 pi pi-fw pi-pen-to-square"></i>
            ),
            command: () =>
                Swal.fire({
                    title: "Are you sure?",
                    text: "You will be able to edit this employee!",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Edit it!",
                }).then((result) => {
                    if (result.isConfirmed) {
                        handleEdit(selectedResearch);
                    }
                }),
            visible: user.UserType === "Administrative User",
        },
        {
            label: "Delete",
            icon: <i className="m-1 text-red-500 pi pi-fw pi-trash"></i>,
            command: async () => {
                await Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        if (result.isConfirmed) {
                            Swal.fire({
                                title: "Are you really sure?",
                                text: "This action is permanent and can't be undone.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                confirmButtonText: "Yes, I'm really sure!",
                            }).then(async (result2) => {
                                if (result2.isConfirmed) {
                                    try {
                                        await destroy(
                                            route("Research.destroy", data),
                                            {
                                                preserveScroll: true,
                                            }
                                        );
                                        toast.current.show({
                                            severity: "success",
                                            summary: "Research Deleted",
                                            detail: data.research_title,
                                            life: 3000,
                                        });
                                    } catch (error) {
                                        console.error(error);
                                        toast.current.show({
                                            severity: "error",
                                            summary: "Error",
                                            detail: error.message,
                                            life: 3000,
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            },
            visible: user.UserType === "Administrative User",
        },
    ];

    const handleEdit = (rowData) => {
        editResearch(rowData);
        console.log(rowData);
    };

    const addNewAuthor = (author) => {
        setSelectedAuthor(author);
        // console.log("New Author", author);
    };

    const paginatorLeft = (
        <Button
            type="button"
            icon="pi pi-refresh"
            text
            onClick={() => window.location.reload()}
        />
    );

    const paginatorRight = <Button type="button" icon="pi pi-download" text />;

    const openNew = () => {
        setResearch(emptyResearch);
        setSubmitted(false);
        setCreateResearch(true);
        setResearchDialog(true);
    };

    const hideAddDialog = () => {
        setSelectedAuthor("");
        setAuthorDialog(false);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResearchDialog(false);
        setCreateResearch(false);
        setEdit_Research(false);

        event.preventDefault();
    };

    const editResearch = (employee) => {
        setResearch({ ...employee, old_id: employee.id_no });
        setEdit_Research(true);
        setResearchDialog(true);
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || "";
        let _research = { ...research };

        _research[`${name}`] = val;

        setResearch(_research);
    };

    const header = (
        <div>
            <div className="flex justify-between p-2">
                <div className="flex items-center justify-center w-1/2 gap-2 p-2 m-auto">
                    <h4 className="m-0">Search Employee: </h4>
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText
                            type="search"
                            onInput={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search..."
                            className="w-full"
                        />
                    </IconField>
                </div>

                <Button
                    label="New"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                    className="p-3 px-5 m-auto"
                    disabled={processing}
                />
            </div>
        </div>
    );

    async function handleSubmit(e) {
        try {
            e.preventDefault();
            await post(route("Research.store", data), {
                preserveScroll: true,
            });
            await hideDialog();
            await showSuccessAlert("Research Submitted Successfully");
            await toast.current.show({
                severity: "success",
                summary: "Research Submitted",
                detail: data.research_title,
                life: 3000,
            });
        } catch (error) {
            console.error(error);
        }
    }

    // async function handleDestroy(e) {
    //     try {
    //         await destroy(route("Research.destroy", data.id), {
    //             preserveScroll: true,
    //         });
    //         await toast.current.show({
    //             severity: "success",
    //             summary: "Research Deleted",
    //             detail: data.id,
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         await showErrorAlert("Failed to update employee");
    //     }
    // }

    async function handleUpdate(e) {
        e.preventDefault();

        try {
            await patch(route("Research.update", data.id), {
                preserveScroll: true,
            });
            await hideDialog();
            await showSuccessAlert("Research updated successfully");
            await toast.current.show({
                severity: "success",
                summary: "Research Updated",
                detail: data.id,
            });
        } catch (error) {
            console.error(error);
            await showErrorAlert("Failed to update research");
        }
    }

    const showSuccessAlert = async (message) => {
        await Swal.fire({
            position: "center",
            icon: "success",
            title: "Success!",
            text: message,
            showConfirmButton: false,
            timer: 3000,
        });
    };

    const showErrorAlert = async (message) => {
        await Swal.fire({
            position: "center",
            icon: "error",
            title: "Oops...",
            text: message,
            showConfirmButton: false,
            timer: 3000,
        });
    };

    console.log(researchData);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Employee
                </h2>
            }
        >
            <Head title="Employee" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="card">
                                <Toast ref={toast} />

                                <ContextMenu
                                    model={menuModel}
                                    ref={cm}
                                    onHide={() => setSelectedResearch(null)}
                                />

                                <DataTable
                                    ref={dt}
                                    value={researchData}
                                    selection={selectedResearch}
                                    onSelectionChange={(e) =>
                                        setSelectedResearch(e.value)
                                    }
                                    dataKey="id"
                                    paginator
                                    rows={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    sortMode="single"
                                    removableSort
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} employees"
                                    paginatorLeft={paginatorLeft}
                                    paginatorRight={paginatorRight}
                                    globalFilter={globalFilter}
                                    header={header}
                                    onContextMenu={(e) =>
                                        cm.current.show(e.originalEvent)
                                    }
                                    contextMenuSelection={selectedResearch}
                                    onContextMenuSelectionChange={(e) => {
                                        setSelectedResearch(e.value);
                                        setData(e.value);
                                    }}
                                >
                                    <Column
                                        selectionMode="single"
                                        exportable={false}
                                    ></Column>
                                    <Column
                                        field="research_title"
                                        header="Research Title"
                                        sortable
                                        style={{ maxWidth: "20rem" }}
                                    ></Column>
                                    <Column
                                        field="research_field"
                                        header="Field of Research"
                                        sortable
                                        style={{ maxWidth: "20rem" }}
                                    ></Column>
                                    <Column
                                        field="research_date"
                                        header="Year Conducted"
                                        sortable
                                        style={{ maxWidth: "10rem" }}
                                    ></Column>
                                    <Column
                                        field="researchers"
                                        header="Researchers"
                                        body={(rowData) =>
                                            rowData.authors
                                                .split(",")
                                                .filter(
                                                    (author) =>
                                                        author.trim() !== ""
                                                )
                                                .map((author, index) => (
                                                    <div key={index}>
                                                        {index + 1}.{" "}
                                                        {author.trim()}
                                                    </div>
                                                ))
                                        }
                                        sortable
                                    ></Column>
                                    <Column
                                        field="research_adviser"
                                        header="Adviser"
                                        sortable
                                    ></Column>
                                </DataTable>
                            </div>

                            {/*Add & Edit Employee // ResearchDialog*/}
                            <Dialog
                                visible={researchDialog}
                                style={{ width: "50rem" }}
                                breakpoints={{
                                    "960px": "75vw",
                                    "641px": "90vw",
                                }}
                                header={`Employee Details:`}
                                modal
                                className="p-fluid"
                                // footer={employeeDialogFooter}
                                onHide={hideDialog}
                                onClose={hideDialog}
                            >
                                <form
                                    onSubmit={
                                        createResearch
                                            ? handleSubmit
                                            : edit_Research
                                            ? handleUpdate
                                            : null
                                    }
                                >
                                    <div>
                                        <div className="py-2 field">
                                            <label
                                                htmlFor="research_title"
                                                className="font-bold"
                                            >
                                                Research Title
                                            </label>
                                            <InputTextarea
                                                id="research_title"
                                                value={
                                                    research.research_title ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    onInputChange(
                                                        e,
                                                        "research_title"
                                                    )
                                                }
                                                autoFocus
                                                className={classNames({
                                                    "p-invalid":
                                                        submitted &&
                                                        !research.research_title,
                                                    "text-center": true,
                                                })}
                                            />
                                            {submitted &&
                                                !research.research_title && (
                                                    <small className="p-error">
                                                        Name is required.
                                                    </small>
                                                )}
                                        </div>

                                        <div className="py-2 field">
                                            <label
                                                htmlFor="research_field"
                                                className="font-bold"
                                            >
                                                Research Field
                                            </label>
                                            <InputTextarea
                                                id="research_field"
                                                value={
                                                    research.research_field ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    onInputChange(
                                                        e,
                                                        "research_field"
                                                    )
                                                }
                                                autoFocus
                                                className={classNames({
                                                    "p-invalid":
                                                        submitted &&
                                                        !research.research_field,
                                                    "text-center": true,
                                                })}
                                            />
                                            {submitted &&
                                                !research.research_field && (
                                                    <small className="p-error">
                                                        Name is required.
                                                    </small>
                                                )}
                                        </div>

                                        <div className="py-2 field">
                                            <label
                                                htmlFor="research_adviser"
                                                className="font-bold"
                                            >
                                                Research Adviser
                                            </label>
                                            <InputText
                                                id="research_adviser"
                                                value={
                                                    research.research_adviser ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    onInputChange(
                                                        e,
                                                        "research_adviser"
                                                    )
                                                }
                                                autoFocus
                                                className={classNames({
                                                    "p-invalid":
                                                        submitted &&
                                                        !research.research_adviser,
                                                    "text-center": true,
                                                })}
                                            />
                                            {submitted &&
                                                !research.research_adviser && (
                                                    <small className="p-error">
                                                        Name is required.
                                                    </small>
                                                )}
                                        </div>

                                        <div className="py-2 field">
                                            <div className="flex items-center gap-4">
                                                <label
                                                    htmlFor="researchers"
                                                    className="font-bold"
                                                >
                                                    Researchers
                                                </label>
                                                <Button
                                                    icon="pi pi-plus"
                                                    rounded
                                                    className="p-button-sm"
                                                    onClick={(e) => {
                                                        setAuthorDialog(true),
                                                            e.preventDefault();
                                                    }}
                                                />
                                            </div>
                                            <div className="w-full p-2">
                                                <div className="grid grid-cols-2 gap-2 list-none">
                                                    {research.authors &&
                                                        research.authors
                                                            .split(", ")
                                                            .map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center justify-between gap-4"
                                                                    >
                                                                        <li>
                                                                            {index +
                                                                                1}
                                                                            .{" "}
                                                                            {
                                                                                item
                                                                            }
                                                                        </li>
                                                                        <Button
                                                                            icon="pi pi-times"
                                                                            rounded
                                                                            className="justify-center h-1 w-7"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault();
                                                                                let newAuthors =
                                                                                    research.authors
                                                                                        .split(
                                                                                            ", "
                                                                                        )
                                                                                        .filter(
                                                                                            (
                                                                                                author
                                                                                            ) =>
                                                                                                author !==
                                                                                                item
                                                                                        );
                                                                                setResearch(
                                                                                    {
                                                                                        ...research,
                                                                                        authors:
                                                                                            newAuthors.join(
                                                                                                ", "
                                                                                            ),
                                                                                        researcher_ids:
                                                                                            getAuthorsIds(
                                                                                                newAuthors
                                                                                            ).join(
                                                                                                ", "
                                                                                            ),
                                                                                    }
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )
                                                            )}
                                                </div>
                                            </div>

                                            {submitted &&
                                                !research.research_description && (
                                                    <small className="p-error">
                                                        Name is required.
                                                    </small>
                                                )}
                                        </div>

                                        <div className="flex gap-4 field">
                                            <div className="py-2 field">
                                                <label
                                                    htmlFor="research_status"
                                                    className="font-bold"
                                                >
                                                    Research Status
                                                </label>

                                                <InputText
                                                    id="research_status"
                                                    value={
                                                        research.research_status ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        onInputChange(
                                                            e,
                                                            "research_status"
                                                        )
                                                    }
                                                    autoFocus
                                                    className={classNames({
                                                        "p-invalid":
                                                            submitted &&
                                                            !research.research_status,
                                                        "text-center": true,
                                                    })}
                                                />
                                                {submitted &&
                                                    !research.research_status && (
                                                        <small className="p-error">
                                                            Name is required.
                                                        </small>
                                                    )}
                                            </div>

                                            <div className="py-2 field">
                                                <label
                                                    htmlFor="research_date"
                                                    className="font-bold"
                                                >
                                                    Research Date
                                                </label>
                                                <InputText
                                                    id="research_date"
                                                    value={
                                                        research.research_date
                                                    }
                                                    onChange={(e) =>
                                                        onInputChange(
                                                            e,
                                                            "research_date"
                                                        )
                                                    }
                                                    autoFocus
                                                    className={classNames({
                                                        "p-invalid":
                                                            submitted &&
                                                            !research.research_date,
                                                        "text-center": true,
                                                    })}
                                                />
                                                {submitted &&
                                                    !research.research_date && (
                                                        <small className="p-error">
                                                            Name is required.
                                                        </small>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="py-2 field">
                                            <label
                                                htmlFor="file_url"
                                                className="font-bold"
                                            >
                                                Research Link
                                            </label>
                                            <InputText
                                                id="id_no"
                                                value={research.file_url}
                                                onChange={(e) =>
                                                    onInputChange(e, "file_url")
                                                }
                                                autoFocus
                                                className={classNames({
                                                    "p-invalid":
                                                        submitted &&
                                                        !research.file_url,
                                                    "text-center": true,
                                                })}
                                            />
                                            {submitted &&
                                                !research.file_url && (
                                                    <small className="p-error">
                                                        Name is required.
                                                    </small>
                                                )}
                                        </div>
                                    </div>
                                    <br />
                                    {/* Dialog Footer */}
                                    <div className="flex float-right gap-2 p-2">
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            outlined
                                            onClick={hideDialog}
                                            className="w-auto"
                                            disabled={processing}
                                        />
                                        <Button
                                            label="Save"
                                            icon="pi pi-check"
                                            onClick={() => {
                                                setData({
                                                    ...research,
                                                });
                                                // setResearchDialog(false);
                                            }}
                                            className="w-auto"
                                            disabled={processing}
                                        />
                                    </div>
                                </form>
                            </Dialog>
                            {/* Add Author to Research // AuthorDialog*/}
                            <Dialog
                                visible={authorDialog}
                                style={{ width: "450px" }}
                                header={
                                    <div className="flex items-center gap-4 justify-content-between">
                                        <div>Add Author</div>
                                        <Button
                                            icon="pi pi-plus"
                                            rounded
                                            className="p-button-sm"
                                            tooltip="Create New Author"
                                            tooltipOptions={{ position: "top" }}
                                            onClick={(e) => {
                                                setAuthorDialog(false),
                                                    setAddAuthor(true),
                                                    e.preventDefault();
                                            }}
                                        />
                                    </div>
                                }
                                modal
                                className="p-fluid"
                                footer={
                                    <div className="flex justify-content-end">
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            onClick={hideAddDialog}
                                            className="p-button-text"
                                        />
                                        <Button
                                            label="Add"
                                            icon="pi pi-check"
                                            disabled={selectedAuthor === ""}
                                            onClick={(e) => {
                                                setResearch({
                                                    ...research,
                                                    researcher_ids:
                                                        research.researcher_ids
                                                            ? research.researcher_ids +
                                                              ", " +
                                                              selectedAuthor.id
                                                            : selectedAuthor.id,
                                                    authors: research.authors
                                                        ? research.authors +
                                                          ", " +
                                                          selectedAuthor.full_name
                                                        : selectedAuthor.full_name,
                                                });
                                                hideAddDialog();
                                            }}
                                            className="p-button-text"
                                        />
                                    </div>
                                }
                                onHide={hideAddDialog}
                            >
                                <div className="py-2 field">
                                    <div className="py-2 field">
                                        <label htmlFor="author_list">
                                            Select Author
                                        </label>
                                        <Dropdown
                                            value={selectedAuthor}
                                            options={notInResearchAuthors}
                                            optionLabel="full_name"
                                            onChange={(e) => {
                                                addNewAuthor(e.value);
                                                // console.log(e.value);
                                            }}
                                            placeholder="Select Author"
                                        />
                                    </div>
                                </div>
                            </Dialog>
                            {/* Create New Author // AddAuthor*/}
                            <Dialog
                                visible={addAuthor}
                                style={{ width: "450px" }}
                                header="Add New Author"
                                modal
                                className="p-fluid"
                                footer={
                                    <div className="flex justify-content-end">
                                        <Button
                                            label="Cancel"
                                            icon="pi pi-times"
                                            onClick={(e) => {
                                                setAddAuthor(false),
                                                    setAuthorDialog(true),
                                                    setNewAuthor(newAuthorName),
                                                    e.preventDefault();
                                            }}
                                            className="p-button-text"
                                        />
                                        <Button
                                            label="Add"
                                            icon="pi pi-check"
                                            onClick={(e) => {
                                                if (
                                                    !newAuthor.first_name.trim() ||
                                                    !newAuthor.last_name.trim()
                                                ) {
                                                    if (
                                                        !newAuthor.first_name.trim() &&
                                                        !newAuthor.last_name.trim()
                                                    ) {
                                                        toast.current.show({
                                                            severity: "error",
                                                            summary:
                                                                "Please Provide Author Name: Last name & First name",
                                                            detail: newAuthor.full_name,
                                                        });
                                                    } else if (
                                                        !newAuthor.first_name.trim()
                                                    ) {
                                                        toast.current.show({
                                                            severity: "error",
                                                            summary:
                                                                "Please Provide Author Name",
                                                        });
                                                    } else if (
                                                        !newAuthor.last_name.trim()
                                                    ) {
                                                        toast.current.show({
                                                            severity: "error",
                                                            summary:
                                                                "Please Provide Author Name: Last name",
                                                        });
                                                    }
                                                } else {
                                                    let isAuthorExists = false;

                                                    author_list.forEach(
                                                        (author) => {
                                                            if (
                                                                author.full_name.trim() ===
                                                                newAuthor.full_name.trim()
                                                            ) {
                                                                isAuthorExists = true;
                                                            }
                                                        }
                                                    );

                                                    if (isAuthorExists) {
                                                        toast.current.show({
                                                            severity: "error",
                                                            summary:
                                                                "Researcher Already Exists",
                                                            detail: newAuthor.full_name,
                                                        });
                                                    } else {
                                                        setResearch(
                                                            (prevState) => ({
                                                                ...prevState,
                                                                authors:
                                                                    prevState.authors
                                                                        ? `${prevState.authors}, ${newAuthor.full_name}`
                                                                        : newAuthor.full_name,
                                                                new_authors:
                                                                    prevState.new_authors
                                                                        ? `${prevState.new_authors}, ${newAuthor.full_name}`
                                                                        : newAuthor.full_name,
                                                            })
                                                        );
                                                    }
                                                }
                                                setAddAuthor(false);
                                                setNewAuthor(newAuthorName);
                                            }}
                                            className="p-button-text"
                                        />
                                    </div>
                                }
                                onHide={() => {
                                    setAddAuthor(false);
                                    setAuthorDialog(true),
                                        setNewAuthor(newAuthorName);
                                }}
                            >
                                <div className="py-2 field">
                                    <div className="py-2 field">
                                        <InputText
                                            id="full_name"
                                            value={newAuthor.full_name || ""}
                                            placeholder="Full Name"
                                            readOnly
                                        />
                                    </div>
                                    <div className="py-2 field">
                                        <label
                                            htmlFor="first_name"
                                            className="font-bold"
                                        >
                                            First Name
                                        </label>
                                        <InputText
                                            id="first_name"
                                            required
                                            value={newAuthor.first_name || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const newVal = val
                                                    .split(/[,\s]+/)
                                                    .map(
                                                        (word) =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word
                                                                .slice(1)
                                                                .toLowerCase()
                                                    )
                                                    .join(" ");
                                                setNewAuthor({
                                                    ...newAuthor,
                                                    first_name: newVal,
                                                });
                                            }}
                                            onBlur={() => {
                                                updateFullName();
                                            }}
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div className="py-2 field">
                                        <label
                                            htmlFor="middle_name"
                                            className="font-bold"
                                        >
                                            Middle Name
                                        </label>
                                        <InputText
                                            id="middle_name"
                                            value={newAuthor.middle_name || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const newVal = val
                                                    .split(/[,\s]+/)
                                                    .map(
                                                        (word) =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word
                                                                .slice(1)
                                                                .toLowerCase()
                                                    )
                                                    .join(" ");
                                                setNewAuthor({
                                                    ...newAuthor,
                                                    middle_name: newVal,
                                                });
                                            }}
                                            onBlur={() => {
                                                updateFullName();
                                            }}
                                            placeholder="Middle Name"
                                        />
                                    </div>
                                    <div className="py-2 field">
                                        <label
                                            htmlFor="last_name"
                                            className="font-bold"
                                        >
                                            Last Name
                                        </label>
                                        <InputText
                                            id="last_name"
                                            required
                                            value={newAuthor.last_name || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const newVal = val
                                                    .split(/[,\s]+/)
                                                    .map(
                                                        (word) =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word
                                                                .slice(1)
                                                                .toLowerCase()
                                                    )
                                                    .join(" ");
                                                setNewAuthor({
                                                    ...newAuthor,
                                                    last_name: newVal,
                                                });
                                            }}
                                            onBlur={() => {
                                                updateFullName();
                                            }}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <div className="py-2 field">
                                        <label
                                            htmlFor="suffix_name"
                                            className="font-bold"
                                        >
                                            Suffix
                                        </label>
                                        <InputText
                                            id="suffix_name"
                                            value={newAuthor.suffix_name || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const newVal =
                                                    val.toUpperCase();
                                                setNewAuthor({
                                                    ...newAuthor,
                                                    suffix_name: newVal,
                                                });
                                            }}
                                            onBlur={() => {
                                                updateFullName();
                                            }}
                                            placeholder="Suffix"
                                        />
                                    </div>
                                </div>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
