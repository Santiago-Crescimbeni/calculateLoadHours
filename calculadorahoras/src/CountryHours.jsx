import React, { useState } from "react";

const countries = [
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "CE", name: "Cencosud" },
  { code: "BBHH", name: "Peru" },
  { code: "CA", name: "Caribe" },
  { code: "Ja", name: "Jamaica" },
  { code: "MX", name: "Mexico" },
  { code: "CR", name: "Costa Rica" },
  { code: "PA", name: "Panama" },
];

const Sections = ["EZ", "CZ"];

const calculateDuration = (start, startPeriod, finish, finishPeriod) => {
  if (!start || !finish) return "";

  let [sh, sm] = start.split(":").map(Number);
  let [fh, fm] = finish.split(":").map(Number);

  if (startPeriod === "PM" && sh < 12) sh += 12;
  if (startPeriod === "AM" && sh === 12) sh = 0;

  if (finishPeriod === "PM" && fh < 12) fh += 12;
  if (finishPeriod === "AM" && fh === 12) fh = 0;

  let startMinutes = sh * 60 + sm;
  let finishMinutes = fh * 60 + fm;

  let diff = finishMinutes - startMinutes;
  if (diff < 0) diff += 24 * 60;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${minutes}m`;
};

const CountryHours = () => {
  const [data, setData] = useState({});

  const handleChange = (countryCode, section, field, value) => {
    setData((prev) => {
      const current = prev[countryCode]?.[section] || {};
      const newSection = {
        ...current,
        [field]: value,
      };

      const start = newSection.start || "";
      const finish = newSection.finish || "";
      const startPeriod = newSection.startPeriod || "AM";
      const finishPeriod = newSection.finishPeriod || "AM";

      const total = calculateDuration(start, startPeriod, finish, finishPeriod);

      return {
        ...prev,
        [countryCode]: {
          ...prev[countryCode],
          [section]: {
            ...newSection,
            total,
          },
        },
      };
    });
  };

  const handleTimeChange = (e, countryCode, section, field) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    
    // Si tiene 4 dígitos (tipo "0730")
    if (/^\d{4}$/.test(value)) {
      let hours = parseInt(value.slice(0, 2), 10);
      let minutes = parseInt(value.slice(2, 4), 10);

      if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes < 60) {
        let formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
        value = `${formattedHours}:${value.slice(2, 4)}`;
      } else {
        return; // inválido
      }
    }

    // Si tiene 3 dígitos (tipo "730")
    else if (/^\d{3}$/.test(value)) {
      let hours = parseInt(value.charAt(0), 10);
      let minutes = parseInt(value.slice(1, 3), 10);

      if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes < 60) {
        value = `${hours}:${value.slice(1, 3)}`;
      } else {
        return; // inválido
      }
    } else if (value.length > 4) {
      value = value.slice(0, 4);
    }

    handleChange(countryCode, section, field, value);
  };

  const togglePeriod = (countryCode, section, field) => {
    setData((prev) => {
      const current = prev[countryCode]?.[section] || {};
      const currentPeriod = current[field] || "AM";
      const newPeriod = currentPeriod === "AM" ? "PM" : "AM";

      const newSection = {
        ...current,
        [field]: newPeriod,
      };

      const start = newSection.start || current.start || "";
      const finish = newSection.finish || current.finish || "";
      const startPeriod = newSection.startPeriod || current.startPeriod || "AM";
      const finishPeriod = newSection.finishPeriod || current.finishPeriod || "AM";

      const total = calculateDuration(start, startPeriod, finish, finishPeriod);

      return {
        ...prev,
        [countryCode]: {
          ...prev[countryCode],
          [section]: {
            ...newSection,
            total,
          },
        },
      };
    });
  };

  // Calcular la suma total de EZ + CZ por país
  const calculateTotal = (countryCode) => {
    const ezTotal = data[countryCode]?.EZ?.total || "0h 0m";
    const czTotal = data[countryCode]?.CZ?.total || "0h 0m";

    // Extraer horas y minutos
    const [ezHours, ezMinutes] = ezTotal.split("h").map((time) => time.trim());
    const [czHours, czMinutes] = czTotal.split("h").map((time) => time.trim());

    const totalMinutes =
      (parseInt(ezHours || 0) * 60 + parseInt(ezMinutes || 0)) +
      (parseInt(czHours || 0) * 60 + parseInt(czMinutes || 0));

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${totalHours}h ${remainingMinutes}m`;
  };

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#f4f4f4",
      fontFamily: "Segoe UI, sans-serif",
    },
    title: {
      textAlign: "center",
      color: "#333",
    },
    card: {
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "20px",
      margin: "20px auto",
      maxWidth: "700px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    },
    countryTitle: {
      color: "#007bff",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    section: {
      marginTop: "10px",
      paddingTop: "10px",
      borderTop: "1px solid #eee",
    },
    label: {
      marginRight: "20px",
      display: "inline-block",
    },
    input: {
      padding: "5px 10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
      marginLeft: "5px",
    },
    totalContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "15px", // Separar más el total
    },
    totalInput: (total) => ({
      ...styles.input,
      textAlign: "center",
      backgroundColor: total ? "#f44336" : "#f0f0f0", // Rojo cuando tiene valor
      color: total ? "#fff" : "#000",
      fontWeight: total ? "bold" : "normal", // Negrita cuando tiene valor
      width: "120px", // Aumentar el ancho
    }),
    toggle: (period) => ({
      marginLeft: "5px",
      cursor: "pointer",
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "5px 10px",
      backgroundColor: period === "PM" ? "#ff9800" : "#eee",
      color: period === "PM" ? "#fff" : "#000",
      fontWeight: "bold",
    }),
    // Media Queries
    "@media (max-width: 768px)": {
      container: {
        padding: "10px",
      },
      card: {
        padding: "15px",
        margin: "10px",
      },
      countryTitle: {
        flexDirection: "column",
        alignItems: "flex-start",
      },
      section: {
        marginTop: "15px",
        paddingTop: "15px",
      },
      input: {
        width: "100%", // Hacer que los inputs ocupen el 100% del ancho
      },
      totalInput: {
        width: "100%", // Total input con ancho completo
      },
      label: {
        display: "block",
        marginBottom: "10px",
      },
      toggle: {
        fontSize: "12px", // Reducir tamaño de los botones en pantallas pequeñas
      },
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gestión de Horarios con AM/PM</h1>
      {countries.map((country) => (
        <div key={country.code} style={styles.card}>
          <div style={styles.countryTitle}>
            <h2>{country.code} - {country.name}</h2>
            <span>Total EZ + CZ: 
              <span style={{ color: data[country.code]?.EZ?.total && data[country.code]?.CZ?.total ? "#f44336" : "" }}>
                {calculateTotal(country.code)}
              </span>
            </span>
          </div>
          {Sections.map((section) => (
            <div key={section} style={styles.section}>
              <h4>{section}</h4>
              <label style={styles.label}>
                Start:
                <input
                  type="text"
                  maxLength="5"
                  style={styles.input}
                  value={data[country.code]?.[section]?.start || ""}
                  onChange={(e) =>
                    handleTimeChange(e, country.code, section, "start")
                  }
                />
                <button
                  style={styles.toggle(
                    data[country.code]?.[section]?.startPeriod || "AM"
                  )}
                  onClick={() =>
                    togglePeriod(country.code, section, "startPeriod")
                  }
                >
                  {data[country.code]?.[section]?.startPeriod || "AM"}
                </button>
              </label>
              <label style={styles.label}>
                Finish:
                <input
                  type="text"
                  maxLength="5"
                  style={styles.input}
                  value={data[country.code]?.[section]?.finish || ""}
                  onChange={(e) =>
                    handleTimeChange(e, country.code, section, "finish")
                  }
                />
                <button
                  style={styles.toggle(
                    data[country.code]?.[section]?.finishPeriod || "AM"
                  )}
                  onClick={() =>
                    togglePeriod(country.code, section, "finishPeriod")
                  }
                >
                  {data[country.code]?.[section]?.finishPeriod || "AM"}
                </button>
              </label>
              <div style={styles.totalContainer}>
                <input
                  type="text"
                  style={styles.totalInput(data[country.code]?.[section]?.total)}
                  value={data[country.code]?.[section]?.total || ""}
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CountryHours;
