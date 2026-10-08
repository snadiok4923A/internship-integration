"use strict";

const API_BASE_URL = "http://localhost:3000/api";
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const elements = {
  searchForm: document.querySelector(".search-form"),
  searchInput: document.querySelector("#search-input"),
  domainFilter: document.querySelector("#domain-filter"),
  locationFilter: document.querySelector("#location-filter"),
  workTypeFilter: document.querySelector("#work-type-filter"),
  stipendFilter: document.querySelector("#stipend-filter"),
  durationFilter: document.querySelector("#duration-filter"),
  sortSelect: document.querySelector("#sort-select"),
  clearFilters: document.querySelector("#clear-filters"),
  emptyClearFilters: document.querySelector("#empty-clear-filters"),
  resultCount: document.querySelector("#result-count"),
  grid: document.querySelector("#internship-grid"),
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  retryLoad: document.querySelector("#retry-load"),
  emptyState: document.querySelector("#empty-state"),
  dialog: document.querySelector("#details-dialog"),
  dialogContent: document.querySelector("#dialog-content"),
  dialogClose: document.querySelector("#dialog-close"),
  menuToggle: document.querySelector(".menu-toggle"),
  navigation: document.querySelector("#primary-navigation"),
  applicationForm: document.querySelector("#application-form"),
  applicationPosition: document.querySelector("#application-position"),
  applicationStatus: document.querySelector("#application-status"),
  internshipIdField: document.querySelector("#internship-id"),
  internshipCompany: document.querySelector("#internship-company"),
  submitApplicationButton: document.querySelector("#submit-application"),
  cancelApplication: document.querySelector("#cancel-application"),
  applicationClose: document.querySelector("#application-close")
};

const avatarPalettes = [
  { background: "#eef0ff", ink: "#5368dc", border: "#e0e3ff" },
  { background: "#e8f7f1", ink: "#218363", border: "#d7f0e5" },
  { background: "#fff1e8", ink: "#c87541", border: "#ffeadb" },
  { background: "#f7edff", ink: "#8d5ab9", border: "#eee0fc" },
  { background: "#eaf4ff", ink: "#3b78b8", border: "#dcecff" },
  { background: "#fff0f3", ink: "#bd5c74", border: "#ffe2e9" }
];

let internships = [];
let internshipPagination = null;
let internshipRequest = null;
let dialogInvoker = null;
let currentlySelectedInternship = null;

function formatCurrency(amount) {
  return `${CURRENCY_FORMATTER.format(amount)} / mo`;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getInitials(company) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function createAvatar(company, id) {
  const palette = avatarPalettes[(Number(id) - 1) % avatarPalettes.length];
  const avatar = document.createElement("span");
  avatar.className = "company-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = getInitials(company);
  avatar.style.setProperty("--avatar-bg", palette.background);
  avatar.style.setProperty("--avatar-ink", palette.ink);
  avatar.style.setProperty("--avatar-border", palette.border);
  return avatar;
}

function createIcon(pathMarkup) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 20 20");
  icon.setAttribute("fill", "none");
  icon.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathMarkup);
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  icon.append(path);
  return icon;
}

function createMetaItem(label, iconPath, extraClass = "") {
  const item = document.createElement("span");
  item.className = `meta-item${extraClass ? ` ${extraClass}` : ""}`;
  if (iconPath) {
    item.append(createIcon(iconPath));
  }
  item.append(document.createTextNode(label));
  return item;
}

function createInternshipCard(internship) {
  const article = document.createElement("article");
  article.className = "internship-card";

  const topLine = document.createElement("div");
  topLine.className = "card-topline";

  const companyLockup = document.createElement("div");
  companyLockup.className = "company-lockup";
  companyLockup.append(createAvatar(internship.company, internship.id));

  const companyName = document.createElement("span");
  companyName.className = "company-name";
  companyName.textContent = internship.company;
  companyLockup.append(companyName);

  const postedDate = document.createElement("time");
  postedDate.className = "posted-date";
  postedDate.dateTime = internship.created_at || internship.deadline || new Date().toISOString();
  postedDate.textContent = `Posted ${formatDate(internship.created_at ? internship.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10))}`;
  topLine.append(companyLockup, postedDate);

  const heading = document.createElement("h3");
  heading.className = "card-heading";
  heading.textContent = internship.title;

  const domainBadge = document.createElement("span");
  domainBadge.className = "domain-badge";
  domainBadge.textContent = internship.domain;

  const metadata = document.createElement("div");
  metadata.className = "card-meta";
  metadata.append(
    createMetaItem(internship.location, "M10 17s5-4.4 5-9a5 5 0 1 0-10 0c0 4.6 5 9 5 9Z M10 9a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 10 9Z"),
    createMetaItem(internship.work_type || internship.workType, "", "work-type"),
    createMetaItem(internship.duration, "M10 5v5l3 2 M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z")
  );

  const bottomLine = document.createElement("div");
  bottomLine.className = "card-bottomline";
  const stipend = document.createElement("div");
  stipend.className = "stipend";
  const stipendValue = document.createElement("span");
  stipendValue.className = "stipend-value";
  stipendValue.textContent = formatCurrency(internship.stipend);
  const stipendPeriod = document.createElement("span");
  stipendPeriod.className = "stipend-period";
  stipendPeriod.textContent = "Monthly stipend";
  stipend.append(stipendValue, stipendPeriod);

  const actions = document.createElement("div");
  actions.className = "card-actions";
  const detailsButton = document.createElement("button");
  detailsButton.className = "details-button";
  detailsButton.type = "button";
  detailsButton.textContent = "View details";
  detailsButton.setAttribute("aria-label", `View details for ${internship.title} at ${internship.company}`);
  detailsButton.addEventListener("click", () => openDetails(internship));

  const applyButton = document.createElement("button");
  applyButton.className = "apply-button";
  applyButton.type = "button";
  applyButton.textContent = "Apply now";
  applyButton.setAttribute("aria-label", `Apply for ${internship.title} at ${internship.company}`);
  applyButton.addEventListener("click", () => openApplicationForm(internship));

  actions.append(detailsButton, applyButton);
  bottomLine.append(stipend, actions);

  const skills = document.createElement("p");
  skills.className = "visually-hidden";
  skills.textContent = `Skills: ${(internship.skills || []).join(", ")}`;

  article.append(topLine, domainBadge, heading, metadata, bottomLine, skills);
  return article;
}

function addFilterOptions(select, values) {
  const fragment = document.createDocumentFragment();
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    fragment.append(option);
  });
  select.append(fragment);
}

function populateFilters() {
  const domainOptions = internships.map((item) => item.domain);
  const locationOptions = internships.map((item) => item.location);
  const workTypeOptions = internships.map((item) => item.work_type || item.workType);

  elements.domainFilter.replaceChildren(new Option("All domains", ""));
  elements.locationFilter.replaceChildren(new Option("All locations", ""));
  elements.workTypeFilter.replaceChildren(new Option("Any work type", ""));

  addFilterOptions(elements.domainFilter, domainOptions);
  addFilterOptions(elements.locationFilter, locationOptions);
  addFilterOptions(elements.workTypeFilter, workTypeOptions);
}

function getDurationInMonths(duration) {
  const match = String(duration || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function matchesStipend(stipend, range) {
  if (!range) {
    return true;
  }
  const [minimum, maximum] = range.split("-").map(Number);
  return Number(stipend) >= minimum && Number(stipend) <= maximum;
}

function sortInternships(results, sortMode) {
  const sortedResults = [...results];
  const comparators = {
    latest: (a, b) => new Date(b.created_at || b.postedDate || 0) - new Date(a.created_at || a.postedDate || 0),
    oldest: (a, b) => new Date(a.created_at || a.postedDate || 0) - new Date(b.created_at || b.postedDate || 0),
    "stipend-high": (a, b) => Number(b.stipend) - Number(a.stipend),
    "stipend-low": (a, b) => Number(a.stipend) - Number(b.stipend),
    "company-az": (a, b) => String(a.company).localeCompare(String(b.company))
  };

  sortedResults.sort(comparators[sortMode] || comparators.latest);
  return sortedResults;
}

function getFilteredInternships() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const domain = elements.domainFilter.value;
  const location = elements.locationFilter.value;
  const workType = elements.workTypeFilter.value;
  const stipendRange = elements.stipendFilter.value;
  const durationRange = elements.durationFilter.value;

  const results = internships.filter((internship) => {
    const searchableText = [
      internship.title,
      internship.company,
      internship.domain,
      internship.location,
      internship.work_type || internship.workType,
      ...(internship.skills || [])
    ].join(" ").toLowerCase();
    const months = getDurationInMonths(internship.duration);
    const [minimumMonths, maximumMonths] = durationRange
      ? durationRange.split("-").map(Number)
      : [0, Number.POSITIVE_INFINITY];

    return (
      (!query || searchableText.includes(query)) &&
      (!domain || internship.domain === domain) &&
      (!location || internship.location === location) &&
      (!workType || (internship.work_type || internship.workType) === workType) &&
      matchesStipend(internship.stipend, stipendRange) &&
      (!durationRange || (months >= minimumMonths && months <= maximumMonths))
    );
  });

  return sortInternships(results, elements.sortSelect.value);
}

function setStateVisible(element, visible) {
  element.hidden = !visible;
  element.style.display = visible ? "" : "none";
}

function renderInternships() {
  const results = getFilteredInternships();
  const fragment = document.createDocumentFragment();
  results.forEach((internship) => fragment.append(createInternshipCard(internship)));
  elements.grid.replaceChildren(fragment);
  elements.resultCount.replaceChildren();

  const count = document.createElement("strong");
  count.textContent = String(results.length);
  const total = document.createElement("strong");
  total.textContent = String(internshipPagination?.total ?? internships.length);
  elements.resultCount.append("Showing ", count, " of ", total, " internships");
  setStateVisible(elements.emptyState, results.length === 0);
}

function createDialogSection(title, content) {
  const section = document.createElement("section");
  section.className = "dialog-section";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading, content);
  return section;
}

function openDetails(internship) {
  dialogInvoker = document.activeElement;
  elements.dialogContent.replaceChildren();

  const titleRow = document.createElement("div");
  titleRow.className = "dialog-title-row";
  titleRow.append(createAvatar(internship.company, internship.id));

  const titleDetails = document.createElement("div");
  const title = document.createElement("h2");
  title.id = "dialog-title";
  title.textContent = internship.title;
  const company = document.createElement("p");
  company.className = "dialog-company";
  company.textContent = internship.company;
  titleDetails.append(title, company);
  titleRow.append(titleDetails);
  elements.dialogContent.append(titleRow);

  const badges = document.createElement("div");
  badges.className = "dialog-badges";
  [
    internship.domain,
    internship.location,
    internship.work_type || internship.workType,
    internship.duration,
    formatCurrency(internship.stipend)
  ].forEach((label) => {
    const badge = document.createElement("span");
    badge.className = "dialog-badge";
    badge.textContent = label;
    badges.append(badge);
  });
  elements.dialogContent.append(badges);

  const description = document.createElement("p");
  description.textContent = internship.description;
  elements.dialogContent.append(createDialogSection("About the internship", description));

  const responsibilities = document.createElement("ul");
  (internship.responsibilities || []).forEach((responsibility) => {
    const item = document.createElement("li");
    item.textContent = responsibility;
    responsibilities.append(item);
  });
  if (responsibilities.children.length > 0) {
    elements.dialogContent.append(createDialogSection("What you’ll do", responsibilities));
  }

  const skills = document.createElement("div");
  skills.className = "dialog-skills";
  (internship.skills || []).forEach((skill) => {
    const item = document.createElement("span");
    item.className = "dialog-skill";
    item.textContent = skill;
    skills.append(item);
  });
  elements.dialogContent.append(createDialogSection("Skills you’ll use", skills));

  const eligibility = document.createElement("p");
  eligibility.textContent = internship.eligibility;
  elements.dialogContent.append(createDialogSection("Who can apply", eligibility));

  const footer = document.createElement("div");
  footer.className = "dialog-footer";
  const deadline = document.createElement("span");
  deadline.className = "deadline-note";
  deadline.textContent = `Apply by ${formatDate(internship.deadline || new Date().toISOString().slice(0, 10))}`;
  const apply = document.createElement("button");
  apply.type = "button";
  apply.className = "apply-button dialog-apply";
  apply.textContent = "Apply for this internship";
  apply.addEventListener("click", () => {
    elements.dialog.close();
    openApplicationForm(internship);
  });
  footer.append(deadline, apply);
  elements.dialogContent.append(footer);

  elements.dialog.showModal();
  elements.dialogClose.focus();
}

function clearFilters() {
  elements.searchInput.value = "";
  elements.domainFilter.value = "";
  elements.locationFilter.value = "";
  elements.workTypeFilter.value = "";
  elements.stipendFilter.value = "";
  elements.durationFilter.value = "";
  elements.sortSelect.value = "latest";
  renderInternships();
  elements.searchInput.focus();
}

function closeMobileMenu() {
  elements.navigation.classList.remove("is-open");
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function toggleMobileMenu() {
  const isOpen = elements.menuToggle.getAttribute("aria-expanded") === "true";
  elements.menuToggle.setAttribute("aria-expanded", String(!isOpen));
  elements.menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  elements.navigation.classList.toggle("is-open", !isOpen);
}

function fetchInternships() {
  if (!internshipRequest) {
    internshipRequest = fetch(`${API_BASE_URL}/internships`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Internship data request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (
          payload?.success !== true ||
          !Array.isArray(payload.data) ||
          !payload.pagination ||
          typeof payload.pagination !== "object" ||
          !Number.isFinite(payload.pagination.total)
        ) {
          throw new Error("Internship API returned an invalid response");
        }

        return {
          data: payload.data,
          pagination: payload.pagination
        };
      })
      .finally(() => {
        internshipRequest = null;
      });
  }

  return internshipRequest;
}

async function loadInternships() {
  if (internshipRequest) {
    return internshipRequest;
  }

  setStateVisible(elements.loadingState, true);
  setStateVisible(elements.errorState, false);
  setStateVisible(elements.emptyState, false);
  elements.grid.replaceChildren();
  elements.resultCount.textContent = "Loading internships…";
  elements.retryLoad.disabled = true;

  let result;
  try {
    result = await fetchInternships();
  } catch (error) {
    console.error("Unable to load internship data:", error);
    internships = [];
    internshipPagination = null;
    populateFilters();
    elements.grid.replaceChildren();
    setStateVisible(elements.loadingState, false);
    setStateVisible(elements.errorState, true);
    setStateVisible(elements.emptyState, false);
    elements.resultCount.textContent = "Internships are unavailable";
    return;
  } finally {
    elements.retryLoad.disabled = false;
  }

  internships = result.data;
  internshipPagination = result.pagination;
  setStateVisible(elements.errorState, false);
  setStateVisible(elements.loadingState, false);
  populateFilters();
  document.querySelector("#stat-internships").textContent = `${internshipPagination.total}+`;
  document.querySelector("#stat-companies").textContent = `${new Set(internships.map((item) => item.company)).size}+`;
  document.querySelector("#stat-domains").textContent = `${new Set(internships.map((item) => item.domain)).size}+`;
  renderInternships();
}

function setErrorState(input, message) {
  const field = input.closest(".field-group");
  const errorElement = field?.querySelector(".error-message");
  if (errorElement) {
    errorElement.textContent = message || "";
  }
  if (input) {
    input.classList.toggle("input-error", Boolean(message));
  }
}

function clearFormErrors() {
  const formFields = elements.applicationForm.querySelectorAll("input, textarea");
  formFields.forEach((input) => {
    input.classList.remove("input-error");
    const error = elements.applicationForm.querySelector(`[data-error-for="${input.name}"]`);
    if (error) {
      error.textContent = "";
    }
  });
}

function validateApplicationForm(data) {
  const errors = {};

  if (!data.full_name || data.full_name.trim().length < 2 || data.full_name.trim().length > 100) {
    errors.full_name = "Full name is required and must be between 2 and 100 characters.";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.phone || !/^[0-9+()\-\s]{7,20}$/.test(data.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!data.education || data.education.trim().length === 0) {
    errors.education = "Education is required.";
  }

  if (!data.college || data.college.trim().length < 2 || data.college.trim().length > 150) {
    errors.college = "College is required.";
  }

  if (!data.resume_url || !/^https?:\/\//i.test(data.resume_url.trim())) {
    errors.resume_url = "Resume URL must be a valid URL.";
  }

  if (!data.cover_message || data.cover_message.trim().length < 20 || data.cover_message.trim().length > 1000) {
    errors.cover_message = "Cover message must contain between 20 and 1000 characters.";
  }

  if (!data.internship_id) {
    errors.internship_id = "Please select an internship.";
  }

  return errors;
}

function applyFieldErrors(errors) {
  const fields = [
    "full_name",
    "email",
    "phone",
    "education",
    "college",
    "resume_url",
    "cover_message"
  ];

  fields.forEach((field) => {
    const input = elements.applicationForm.elements.namedItem(field);
    if (input && errors[field]) {
      setErrorState(input, errors[field]);
    } else if (input) {
      setErrorState(input, "");
    }
  });
}

function setApplicationStatus(message, type = "") {
  elements.applicationStatus.textContent = message;
  elements.applicationStatus.className = "application-status";
  if (type) {
    elements.applicationStatus.classList.add(type);
  }
}

function openApplicationForm(internship) {
  currentlySelectedInternship = internship;
  elements.internshipIdField.value = internship.id;
  elements.internshipCompany.textContent = `${internship.title} at ${internship.company}`;
  elements.applicationPosition.textContent = `Applying for: ${internship.title} | Company: ${internship.company}`;
  clearFormErrors();
  setApplicationStatus("");
  elements.applicationForm.hidden = false;
  elements.applicationForm.scrollIntoView({ behavior: "smooth", block: "end" });
  const firstInput = elements.applicationForm.querySelector('input[name="full_name"]');
  firstInput?.focus();
}

function closeApplicationForm() {
  elements.applicationForm.hidden = true;
  elements.applicationForm.reset();
  clearFormErrors();
  setApplicationStatus("");
  currentlySelectedInternship = null;
}

async function submitApplication(event) {
  event.preventDefault();

  if (!currentlySelectedInternship) {
    setApplicationStatus("Please select an internship before submitting.", "error");
    return;
  }

  clearFormErrors();

  const formData = Object.fromEntries(new FormData(elements.applicationForm).entries());
  formData.internship_id = String(currentlySelectedInternship.id);

  const errors = validateApplicationForm(formData);
  if (Object.keys(errors).length > 0) {
    applyFieldErrors(errors);
    setApplicationStatus("Please fix the highlighted fields and try again.", "error");
    return;
  }

  elements.submitApplicationButton.disabled = true;
  elements.submitApplicationButton.textContent = "Submitting application...";
  setApplicationStatus("Submitting application...", "");

  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (payload.error && payload.error.details) {
        const serverErrors = {};
        payload.error.details.forEach((detail) => {
          serverErrors[detail.field] = detail.message;
        });
        applyFieldErrors(serverErrors);
      }
      setApplicationStatus("Unable to submit your application. Please try again.", "error");
      return;
    }

    setApplicationStatus("Application submitted successfully.", "success");
    closeApplicationForm();
  } catch (error) {
    console.error("Application submission failed:", error);
    setApplicationStatus("Unable to submit your application. Please try again.", "error");
  } finally {
    elements.submitApplicationButton.disabled = false;
    elements.submitApplicationButton.textContent = "Submit application";
  }
}

function attachEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderInternships();
    document.querySelector("#internships").scrollIntoView({ behavior: "smooth" });
  });

  elements.searchInput.addEventListener("input", renderInternships);
  [
    elements.domainFilter,
    elements.locationFilter,
    elements.workTypeFilter,
    elements.stipendFilter,
    elements.durationFilter,
    elements.sortSelect
  ].forEach((control) => control.addEventListener("change", renderInternships));

  elements.clearFilters.addEventListener("click", clearFilters);
  elements.emptyClearFilters.addEventListener("click", clearFilters);
  elements.retryLoad.addEventListener("click", loadInternships);
  elements.dialogClose.addEventListener("click", () => elements.dialog.close());
  elements.dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      elements.dialog.close();
    }
  });
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) {
      elements.dialog.close();
    }
  });
  elements.dialog.addEventListener("close", () => {
    if (dialogInvoker instanceof HTMLElement && dialogInvoker.isConnected) {
      dialogInvoker.focus({ preventScroll: true });
    }
    dialogInvoker = null;
  });
  elements.menuToggle.addEventListener("click", toggleMobileMenu);
  elements.navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMobileMenu();
    }
  });
  elements.cancelApplication.addEventListener("click", closeApplicationForm);
  elements.applicationClose.addEventListener("click", closeApplicationForm);
  elements.applicationForm.addEventListener("submit", submitApplication);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.navigation.classList.contains("is-open")) {
      closeMobileMenu();
      elements.menuToggle.focus();
    }
  });

  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
}

attachEvents();
loadInternships();
