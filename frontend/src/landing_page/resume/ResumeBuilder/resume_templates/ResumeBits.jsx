import React from "react";
import { displayUrl } from "./resumeData";

export function Bullets({ lines, listClassName = "", itemClassName = "" }) {
  if (!lines || lines.length === 0) return null;

  return (
    <ul className={listClassName}>
      {lines.map((line, index) => (
        <li key={index} className={itemClassName}>
          {line}
        </li>
      ))}
    </ul>
  );
}

export function ChipRow({ items, rowClassName = "", chipClassName = "", chipStyle }) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${rowClassName}`}>
      {items.map((item) => (
        <span key={item} className={chipClassName} style={chipStyle}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function ProjectLinks({ project, rowClassName = "", linkClassName = "" }) {
  const links = [
    project.github && { href: project.github, label: displayUrl(project.github) },
    project.live && { href: project.live, label: displayUrl(project.live) },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 ${rowClassName}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClassName}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function MetaLine({ items, separator = "·", className = "" }) {
  const values = (items || []).filter(Boolean);
  if (values.length === 0) return null;

  return <p className={className}>{values.join(` ${separator} `)}</p>;
}
