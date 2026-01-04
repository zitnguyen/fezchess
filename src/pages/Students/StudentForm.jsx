import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import studentService from "../../services/studentService";

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const formRef = useRef(null);
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    dateOfBirth: "",
    address: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    skillLevel: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      console.log("Fetching student with id:", id);
      const response = await studentService.getById(id);
      console.log("Fetched student data:", response);
      setFormData({
        fullName: String(response.fullName || ""),
        studentId: String(response.studentId || ""),
        dateOfBirth: response.dateOfBirth ? response.dateOfBirth.split("T")[0] : "",
        address: response.address || "",
        enrollmentDate: response.enrollmentDate ? response.enrollmentDate.split("T")[0] : "",
        skillLevel: response.skillLevel || "",
      });
    } catch (err) {
      setError("Lỗi khi tải dữ liệu học viên");
      console.error("Error fetching student:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const fullNameStr = String(formData.fullName || "").trim();
    const studentIdStr = String(formData.studentId || "").trim();

    if (!fullNameStr) {
      setError("Vui lòng nhập họ tên học viên");
      return;
    }
    if (!studentIdStr) {
      setError("Vui lòng nhập mã học viên");
      return;
    }

    // Convert studentId to number for backend
    const payload = {
      ...formData,
      studentId: Number(studentIdStr),
      // Ensure specific fields are undefined if empty to avoid backend issues if needed,
      // or send as empty strings if backend allows.
      // Based on schema, studentId is number, required.
    };
    
    if (isNaN(payload.studentId)) {
        setError("Mã học viên phải là số");
        return;
    }

    try {
      setSubmitting(true);
      console.log("Submitting form data:", payload);
      if (isEditMode) {
        await studentService.update(id, payload);
        alert("Cập nhật học viên thành công!");
      } else {
        await studentService.create(payload);
        alert("Thêm học viên thành công!");
      }
      navigate("/students");
    } catch (err) {
      console.error("Error saving student:", err);
      setError(
        err.response?.data?.message || "Lỗi khi lưu dữ liệu: " + err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate("/students")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={24} color="#374151" />
          </button>
          <div>
            <h1>{isEditMode ? "Chỉnh sửa học viên" : "Thêm học viên mới"}</h1>
            <p className="page-subtitle">
              {isEditMode
                ? "Cập nhật thông tin học viên"
                : "Điền thông tin học viên mới"}
            </p>
          </div>
        </div>
        <button
          onClick={() => formRef.current?.requestSubmit()}
          disabled={submitting}
          className="btn-primary"
          style={{ display: "inline-flex", gap: "8px" }}
          type="button"
        >
          <Save size={18} />
          <span>{submitting ? "Đang lưu..." : "Lưu"}</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {/* Họ tên */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Họ tên <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ tên"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
                required
              />
            </div>

            {/* Mã học viên */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Mã HV (Số) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="VD: 101"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
                required
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Ngày sinh
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Ngày nhập học */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Ngày nhập học
              </label>
              <input
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Trình độ */}
            <div>
               <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Trình độ (Skill Level)
              </label>
              <input
                type="text"
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                placeholder="VD: Beginner, Intermediate"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>

             {/* Địa chỉ */}
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Địa chỉ
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            </div>

          </div>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={() => navigate("/students")}
              style={{
                padding: "8px 16px",
                border: "1px solid #D1D5DB",
                background: "#F9FAFB",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
